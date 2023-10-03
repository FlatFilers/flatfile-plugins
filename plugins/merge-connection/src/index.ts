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
const MAX_SYNC_ATTEMPTS = 30 // 5 minutes
const SYNC_RETRY_INTERVAL_MS = 10000 // 10 seconds

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
        handleConnectedWorkbookSync()
      )
    )
  }
}

function handleCreateConnectedWorkbooks(category: string) {
  return async (event: FlatfileEvent, tick) => {
    try {
      const { spaceId, environmentId, jobId } = event.context

      const job = await api.jobs.get(jobId)
      const jobInput = job.data.input
      const publicToken = jobInput.publicToken
      const apiKey = await getSpaceEnvSecret(
        spaceId,
        environmentId,
        MERGE_ACCESS_KEY
      )

      if (!apiKey) {
        throw new Error('Missing Merge API key')
      }

      const mergeClient = new MergeClient({
        environment: MergeEnvironment.Production,
        apiKey,
      })
      const { accountToken, integration }: Merge.accounting.AccountToken =
        await mergeClient[category].accountToken.retrieve(publicToken)

      await tick(20, 'Retrieved account token...')

      const sheets = await openApiSchemaToSheetConfig(category)

      await tick(40, 'Retrieved sheet config...')

      const { data: workbook } = await api.workbooks.create({
        spaceId,
        environmentId,
        name: integration.name,
        labels: ['connection'],
        sheets,
        actions: [
          {
            operation: 'syncConnectedWorkbook',
            mode: 'foreground',
            label: 'Sync',
            type: 'string',
            description: `Sync data from ${integration.name}.`,
          },
        ],
        metadata: {
          connections: [
            {
              source: 'Merge',
              service: category,
              lastSyncedAt: new Date().toISOString(),
              category,
            },
          ],
        },
      })

      await tick(60, 'Created connected workbook...')

      await api.secrets.upsert({
        name: `${workbook.id}:MERGE_X_ACCOUNT_TOKEN`,
        value: accountToken,
        environmentId,
        spaceId,
      })

      await tick(80, 'Created account token secret...')

      await api.jobs.create({
        type: 'workbook',
        operation: 'syncConnectedWorkbook',
        status: 'ready',
        source: workbook.id,
        trigger: 'immediate',
        mode: 'foreground',
      })

      await tick(90, 'Created workbook sync job...')

      return {
        outcome: {
          next: {
            type: 'id',
            id: workbook.id,
            label: 'Go to workbook...',
          },
          message: `We've created a connected Workbook that perfectly matches the Merge.dev schema for ${integration.name}, ensuring a seamless connection and easy synchronization going forward.`,
        },
      } as Flatfile.JobCompleteDetails
    } catch (e) {
      console.error(e)
      throw new Error(`Error creating connected workbook: ${e.message}`)
    }
  }
}

function handleConnectedWorkbookSync() {
  return async (event: FlatfileEvent, tick) => {
    try {
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
      const { data: workbook }: Flatfile.WorkbookResponse =
        await api.workbooks.get(workbookId)
      const connections = workbook.metadata.connections
      const category = connections[0].category // TODO: handle multiple connections
      const { data: sheets } = await api.sheets.list({ workbookId })

      await tick(10, `${workbook.name} syncing to Merge...}`)
      await waitForMergeSync(mergeClient)
      await tick(30, 'Syncing data from Merge...')

      let processedSheets = 0
      for (const sheet of sheets) {
        await syncData(mergeClient, sheet.id, category, sheet.config.slug)
        processedSheets++
        await tick(
          Math.min(90, Math.round(30 + (60 * processedSheets) / sheets.length)),
          `Synced ${sheet.config.name}`
        )
      }

      await api.workbooks.update(workbookId, {
        metadata: {
          connections: [
            {
              ...workbook.metadata.connections[0],
              lastSyncedAt: new Date().toISOString(),
            },
          ],
        },
      })
      await tick(95, 'Updating workbook...')

      return {
        outcome: {
          message: `${workbook.name} data has been successfully synced from ${workbook.name} to Merge.dev and from Merge.dev to Flatfile.`,
        },
      } as Flatfile.JobCompleteDetails
    } catch (e) {
      console.error(e)
      throw new Error(`Error syncing connected workbook: ${e.message}`)
    }
  }
}

const checkAllSyncsComplete = async (
  mergeClient: MergeClient
): Promise<boolean> => {
  try {
    let cursor: string | undefined

    do {
      const paginatedSyncList = await mergeClient.accounting.syncStatus.list({
        cursor,
      })

      const allSyncsComplete = paginatedSyncList.results.every(
        (syncStatus) =>
          syncStatus.status === Merge.accounting.SyncStatusStatusEnum.Done
      )

      if (!allSyncsComplete) {
        return false
      }

      cursor = paginatedSyncList.next
    } while (cursor)

    return true
  } catch (e) {
    console.error(e)
    throw new Error(`Error checking sync status: ${e.message}`)
  }
}

async function waitForMergeSync(mergeClient: MergeClient): Promise<void> {
  try {
    let attempts = 0
    let syncStatusComplete = false

    while (attempts <= MAX_SYNC_ATTEMPTS && !syncStatusComplete) {
      syncStatusComplete = await checkAllSyncsComplete(mergeClient)

      if (!syncStatusComplete) {
        attempts++
        console.log('Waiting for Merge to sync...')
        await new Promise((resolve) =>
          setTimeout(resolve, SYNC_RETRY_INTERVAL_MS)
        )
      }
    }

    if (!syncStatusComplete) {
      throw new Error('Merge sync timed out')
    }
  } catch (e) {
    console.error(e)
    throw new Error(`Error waiting for Merge sync: ${e.message}`)
  }
}

async function deleteSheetRecords(sheetId: string) {
  try {
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
  } catch (e) {
    console.error(e)
    throw new Error(`Error deleting records from sheet ${sheetId}`)
  }
}

async function syncData(
  mergeClient: MergeClient,
  sheetId: string,
  category: string,
  slug: string
) {
  try {
    await deleteSheetRecords(sheetId)

    const model = mergeClient[category][slug]
    let paginatedList
    do {
      paginatedList = await model.list({ cursor: paginatedList?.next })
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
  try {
    const secrets: Flatfile.SecretsResponse = await api.secrets.list({
      spaceId,
      environmentId,
    })
    return secrets.data.find((secret) => secret.name === name)?.value
  } catch (e) {
    console.error(e)
    throw new Error(`Error fetching secret ${name}`)
  }
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

async function openApiSchemaToSheetConfig(
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
        // readonly: property.readOnly || false,
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

    const sheetConfigs: Flatfile.SheetConfig[] = []
    for (const [name, schema] of Object.entries(schemas)) {
      if (
        categoryModels[category] &&
        categoryModels[category].hasOwnProperty(name)
      ) {
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
          slug: categoryModels[category][name],
          fields: fields,
        })
      }
    }

    return sheetConfigs
  } catch (error) {
    console.error('Error fetching or processing schema:', error.message)
    throw new Error("Couldn't fetch or process schema")
  }
}

const categoryModels = {
  accounting: {
    Account: 'accounts',
    Address: 'addresses',
    Attachment: 'attachments',
    BalanceSheet: 'balanceSheets',
    CashFlowStatement: 'cashFlowStatements',
    CompanyInfo: 'companyInfo',
    CreditNote: 'creditNotes',
    Expense: 'expenses',
    IncomeStatement: 'incomeStatements',
    Invoice: 'invoices',
    Item: 'items',
    JournalEntry: 'journalEntries',
    Payment: 'payments',
    PhoneNumber: 'phoneNumbers',
    PurchaseOrder: 'purchaseOrders',
    TaxRate: 'taxRates',
    TrackingCategory: 'trackingCategories',
    Transaction: 'transactions',
    VendorCredit: 'vendorCredits',
  },
  hris: {
    BankInfo: 'bankInfo',
    Benefit: 'benefits',
    Company: 'companies',
    Dependent: 'dependents',
    EmployeePayrollRun: 'employeePayrollRuns',
    Employee: 'employees',
    EmployerBenefit: 'employerBenefits',
    Employment: 'employments',
    Group: 'groups',
    Location: 'locations',
    PayGroup: 'payGroups',
    PayrollRun: 'payrollRuns',
    TimeOff: 'timeOff',
    TimeOffBalance: 'timeOffBalances',
  },
}
