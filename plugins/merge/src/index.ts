import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { asyncBatch } from '@flatfile/util-common'
import {
  Merge,
  MergeClient,
  MergeEnvironment,
} from '@mergeapi/merge-node-client'
import axios from 'axios'

const MERGE_ACCESS_KEY = 'MERGE_ACCESS_KEY'

export default function mergePlugin(category: string) {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        'space:createConnectedWorkbook',
        handleCreateConnectedWorkbooks(category)
      )
    )
    listener.use(
      jobHandler(
        'workbook:syncConnectedWorkbook',
        handleConnectedWorkbookSync(category)
      )
    )
  }
}

function handleCreateConnectedWorkbooks(category: string) {
  return async (event: FlatfileEvent) => {
    const { spaceId, environmentId, jobId } = event.context

    const job = await api.jobs.get(jobId)
    const jobInput = job.data.input
    const publicToken = jobInput.publicToken
    const apiKey = await getSpaceEnvSecret(
      spaceId,
      environmentId,
      MERGE_ACCESS_KEY
    )
    const mergeClient = new MergeClient({
      environment: MergeEnvironment.Production,
      apiKey,
    })
    const { accountToken, integration }: Merge.accounting.AccountToken =
      await mergeClient[category].accountToken.retrieve(publicToken)

    const sheets = await convertToSheetConfig(category)
    const { data: workbook } = await api.workbooks.create({
      spaceId,
      environmentId,
      name: `[connection] ${integration.name}`,
      labels: ['connection'],
      sheets,
      actions: [
        {
          operation: 'syncConnectedWorkbook',
          mode: 'foreground',
          label: 'Sync',
          type: 'string',
          description: `Sync data from ${integration.name}.`,
          primary: true,
        },
      ],
      // Todo: set metadata/connection
    })

    await api.secrets.upsert({
      name: `${workbook.id}:MERGE_X_ACCOUNT_TOKEN`,
      value: accountToken,
      environmentId,
      spaceId,
    })

    await api.jobs.create({
      type: 'workbook',
      operation: 'syncConnectedWorkbook',
      status: 'ready',
      source: workbook.id,
      trigger: 'immediate',
    })

    return {
      outcome: {
        next: {
          type: 'id',
          id: workbook.id,
          label: 'Go to workbook...',
        },
        message: `Connected workbook created for ${integration.name}.`,
      },
    } as Flatfile.JobCompleteDetails
  }
}

function handleConnectedWorkbookSync(category: string) {
  return async (event: FlatfileEvent) => {
    const { spaceId, workbookId, environmentId } = event.context
    const apiKey = await getSpaceEnvSecret(
      spaceId,
      environmentId,
      MERGE_ACCESS_KEY
    )
    const accountToken = await getSpaceEnvSecret(
      spaceId,
      environmentId,
      `${workbookId}:MERGE_X_ACCOUNT_TOKEN`
    )

    if (!apiKey || !accountToken) {
      throw new Error('Missing Merge API key or account token')
    }

    const mergeClient = new MergeClient({
      environment: MergeEnvironment.Production,
      apiKey,
      accountToken,
    })
    // const { data: workbook } = await api.workbooks.get(workbookId)
    // const workbookMetadata = workbook.metadata
    const { data: sheets } = await api.sheets.list({ workbookId })

    for (const sheet of sheets) {
      await syncData(
        mergeClient,
        sheet.id,
        category,
        sheet.config.slug,
        'todo: lastSyncedAt' //TODO: get lastSyncedAt from workbook metadata
      )
    }
    // TODO: update workbook/metadata/connection/lastSyncedAt

    return {
      outcome: {
        message: 'Connected workbook synced.',
      },
    } as Flatfile.JobCompleteDetails
  }
}

async function deleteSheetRecords(sheetId: string) {
  const { data: records } = await api.records.get(sheetId)
  if (records.records.length > 0) {
    const recordIds = records.records.map((record) => {
      return record.id
    })

    const options = { chunkSize: 100, parallel: 5, debug: true }
    await asyncBatch(
      recordIds,
      async (chunk) => {
        await api.records.delete(sheetId, { ids: chunk })
      },
      options
    )
  }
}

async function syncData(
  mergeClient: MergeClient,
  sheetId: string,
  category: string,
  slug: string,
  lastSyncedAt: string
) {
  try {
    await deleteSheetRecords(sheetId)

    const model = mergeClient[category][slug]
    let paginatedList
    do {
      paginatedList = await model.list({ cursor: paginatedList?.next }) // TODO: pass modified_after:lastSyncedAt
      const records = mapRecords(paginatedList.results)

      if (records.length > 0) {
        await api.records.insert(sheetId, records)
      }
    } while (paginatedList.next)
  } catch (e) {
    console.error(e)
    // throw new Error(`Error syncing ${slug} sheet`)
  }
}

const getSpaceEnvSecret = async (
  spaceId: string,
  environmentId: string,
  name: string
): Promise<string | undefined> => {
  const secrets: Flatfile.SecretsResponse = await api.secrets.list({
    spaceId,
    environmentId,
  })
  return secrets.data.find((secret) => secret.name === name)?.value
}

function mapRecords(records: Record<string, any>): Flatfile.RecordData[] {
  return Object.values(records).map((record) => {
    const mappedRecord: Flatfile.RecordData = {}
    for (let key in record) {
      if (record[key]) {
        mappedRecord[key] = { value: record[key]?.toString() }
      }
    }
    return mappedRecord
  })
}

interface OpenApiSchema {
  type: string
  properties?: Record<string, any>
  enum?: string[]
  description?: string
  readOnly?: boolean
  $ref?: string
  [key: string]: any
}

interface ApiSchemas {
  [key: string]: OpenApiSchema
}

async function convertToSheetConfig(
  category: string
): Promise<Flatfile.SheetConfig[]> {
  try {
    const response = await axios({
      url: `https://api.merge.dev/api/${category}/v1/schema`,
      validateStatus: () => true,
      responseType: 'json',
    })

    if (response.status !== 200) {
      throw new Error(
        `API returned status ${response.status}: ${response.statusText}`
      )
    }

    const schemas: ApiSchemas = response.data.components.schemas

    function convertPropertyToField(
      key: string,
      property: OpenApiSchema
    ): Flatfile.BaseProperty | Flatfile.Property {
      let field: Flatfile.BaseProperty = {
        key: key,
        label: property.title || key,
        // description: property.description,
        readonly: property.readOnly || false,
      }

      if (property.$ref) {
        const refName = property.$ref.split('/').pop()!
        property = schemas[refName]
      } else if (property.allOf) {
        // If allOf is present, assume the first item in the array is a reference to the actual schema
        const refName = property.allOf[0].$ref.split('/').pop()!
        property = schemas[refName]
      }

      switch (property.type) {
        case 'string':
          if (property.enum) {
            return {
              ...field,
              type: 'enum',
              config: {
                options: property.enum.map((e) => ({
                  label: e,
                  value: e,
                })),
              },
            } as Flatfile.EnumProperty
          } else {
            return {
              ...field,
              type: 'string',
            } as Flatfile.Property.String
          }
        case 'integer':
        case 'number':
          return {
            ...field,
            type: 'number',
            config: {
              decimalPlaces: 0, // default decimal places
            },
          } as Flatfile.Property.Number
        case 'boolean':
          return {
            ...field,
            type: 'boolean',
          } as Flatfile.Property.Boolean
        default:
          console.log('Unhandled property type:', property.type)
      }
    }

    function generateSlug(modelName: string) {
      const camelCasedModelName = modelName
        .replace(/\W+(.)/g, function (match, chr) {
          return chr.toUpperCase()
        })
        .replace(/^./, function (chr) {
          return chr.toLowerCase()
        })
      if (camelCasedModelName.endsWith('y')) {
        return camelCasedModelName.slice(0, -1) + 'ies'
      }
      if (camelCasedModelName.endsWith('s')) {
        return camelCasedModelName + 'es'
      }
      return camelCasedModelName + 's'
    }

    const sheetConfigs: Flatfile.SheetConfig[] = []
    for (const [name, schema] of Object.entries(schemas)) {
      if (categoryModels[category].includes(name)) {
        const fields: Flatfile.Property[] = []

        for (const [key, property] of Object.entries(schema.properties || {})) {
          const field = convertPropertyToField(
            key,
            property
          ) as Flatfile.Property
          if (field) {
            fields.push(field)
          }
        }

        sheetConfigs.push({
          name: name,
          slug: generateSlug(name),
          fields: fields,
        })
      }
    }

    return sheetConfigs
  } catch (error) {
    console.error('Error fetching or processing schema:', error.message)
    return []
  }
}

const categoryModels = {
  accounting: [
    'Account',
    'Address',
    'Attachment',
    'BalanceSheet',
    'CashFlowStatement',
    'CompanyInfo',
    'CreditNote',
    'Expense',
    'IncomeStatement',
    'Invoice',
    'Item',
    'JournalEntry',
    'Payment',
    'PhoneNumber',
    'PurchaseOrder',
    'TaxRate',
    'TrackingCategory',
    'Transaction',
    'VendorCredit',
  ],
  hris: [
    'BankInfo',
    'Benefit',
    'Company',
    'Dependent',
    'EmployeePayrollRun',
    'Employee',
    'EmployerBenefit',
    'Employment',
    'Group',
    'Location',
    'PayGroup',
    'PayrollRun',
    'TimeOff',
    'TimeOffBalance',
  ],
}
