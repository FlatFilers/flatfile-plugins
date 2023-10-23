import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { asyncBatch, processRecords } from '@flatfile/util-common'
import {
  Merge,
  MergeClient,
  MergeEnvironment,
} from '@mergeapi/merge-node-client'
import axios from 'axios'

const MERGE_ACCESS_KEY = 'MERGE_ACCESS_KEY'
const MAX_SYNC_ATTEMPTS = 30 // Thirty cycles is equates to approx. 5 minutes
const SYNC_RETRY_INTERVAL_MS = 10000 // 10 seconds
// TODO: add common models to all categories
const CATEGORY_MODELS = {
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
  ats: [],
  crm: [],
  filestorage: [],
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
  ticketing: [],
}

export default function mergePlugin() {
  return (listener: FlatfileListener) => {
    // The `space:createConnectedWorkbook` job is fired when a Merge connection has been made in the UI. `handleCreateConnectedWorkbooks()` creates the connected workbook mirroring the Merge schema.
    listener.use(
      jobHandler(
        'space:createConnectedWorkbook',
        handleCreateConnectedWorkbooks()
      )
    )
    // The `workbook:syncConnectedWorkbook` job syncs the connected workbook and can be triggered by clicking the sync button.
    listener.use(
      jobHandler(
        'workbook:syncConnectedWorkbook',
        handleConnectedWorkbookSync()
      )
    )
  }
}

function handleCreateConnectedWorkbooks() {
  return async (
    event: FlatfileEvent,
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => {
    try {
      const { spaceId, environmentId, jobId } = event.context

      const job = await api.jobs.get(jobId)
      const jobInput = job.data.input
      const publicToken = jobInput.publicToken
      const apiKey = await getSecret(spaceId, environmentId, MERGE_ACCESS_KEY)

      if (!apiKey) {
        throw new Error('Missing Merge API key')
      }

      const mergeClient = getMergeClient(apiKey)

      let accountTokenObj
      let category

      // Since we don't know what category the Merge integration belongs to, we need to try each one
      const categories = Object.keys(CATEGORY_MODELS)
      for (let categoryAttempt of categories) {
        try {
          accountTokenObj = await mergeClient[
            categoryAttempt
          ].accountToken.retrieve(publicToken)
          if (accountTokenObj) {
            category = categoryAttempt
            break // break out of the loop as soon as a valid category is found
          }
        } catch (e) {} // ignore and keep trying
      }
      if (!category || !accountTokenObj) {
        throw new Error('Error retrieving account token')
      }

      const { accountToken, integration } = accountTokenObj

      await tick(20, 'Retrieved account token...')

      // Using the category, we can fetch Merge's schema provided through their OpenAPI spec and convert it to a Flatfile sheet config
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
              lastSyncedAt: new Date().toISOString(), // TODO: is set for UI purposes, but should be updated after sync
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

      // Create a job to sync the workbook immediately
      await api.jobs.create({
        type: 'workbook',
        operation: 'syncConnectedWorkbook',
        status: 'ready',
        source: workbook.id,
        trigger: 'immediate',
        mode: 'foreground',
      })

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
      handleError(e, 'Error creating connected workbook')
    }
  }
}

function handleConnectedWorkbookSync() {
  return async (
    event: FlatfileEvent,
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => {
    try {
      const { spaceId, workbookId, environmentId } = event.context
      const apiKey = await getSecret(spaceId, environmentId, MERGE_ACCESS_KEY)
      const accountToken = await getSecret(
        spaceId,
        environmentId,
        `${workbookId}:MERGE_X_ACCOUNT_TOKEN`
      )

      if (!apiKey || !accountToken) {
        throw new Error('Missing Merge API key or account token')
      }

      const mergeClient = getMergeClient(apiKey, accountToken)
      const { data: workbook }: Flatfile.WorkbookResponse =
        await api.workbooks.get(workbookId)
      const connections = workbook.metadata.connections
      const category = connections[0].category // TODO: handle multiple connections???
      const { data: sheets } = await api.sheets.list({ workbookId })

      await tick(10, `${workbook.name} syncing to Merge...}`)
      // Merge may not have synced with the integration, so we need to check and wait for Merge's sync to complete
      await waitForMergeSync(mergeClient, category, tick)
      await tick(40, 'Syncing data from Merge...')

      // Sync data from Merge to Flatfile
      let processedSheets = 0
      for (const sheet of sheets) {
        await syncData(mergeClient, sheet.id, category, sheet.config.slug)
        processedSheets++
        await tick(
          Math.min(90, Math.round(40 + (50 * processedSheets) / sheets.length)),
          `Synced ${sheet.config.name}`
        )
      }

      // Finally, update the lastSyncedAt date
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
      handleError(e, 'Error syncing connected workbook')
    }
  }
}

async function fetchAllSyncStatuses(
  mergeClient: MergeClient,
  category: string
) {
  let cursor: string | undefined
  const allResults = []

  do {
    const paginatedSyncList = await mergeClient[category].syncStatus.list({
      cursor,
    })
    allResults.push(...paginatedSyncList.results)
    cursor = paginatedSyncList.next
  } while (cursor)

  return allResults
}

async function checkAllSyncsComplete(
  mergeClient: MergeClient,
  category: string
) {
  try {
    const allSyncs = await fetchAllSyncStatuses(mergeClient, category)
    const completedSyncs = allSyncs.filter(
      (syncStatus) =>
        syncStatus.status === Merge[category].SyncStatusStatusEnum.Done
    ).length
    const totalModels = allSyncs.length

    return {
      allComplete: completedSyncs === totalModels,
      completedSyncs,
      totalModels,
    }
  } catch (e) {
    handleError(e, 'Error checking sync status')
  }
}

async function waitForMergeSync(
  mergeClient: MergeClient,
  category: string,
  tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
): Promise<void> {
  try {
    let attempts = 0
    let syncStatusComplete = false

    while (attempts <= MAX_SYNC_ATTEMPTS && !syncStatusComplete) {
      const { allComplete, completedSyncs, totalModels } =
        await checkAllSyncsComplete(mergeClient, category)
      syncStatusComplete = allComplete

      await tick(
        Math.min(40, Math.round(10 + (30 * completedSyncs) / totalModels)),
        'Merge syncing with Integration...'
      )

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
    handleError(e, 'Error waiting for Merge sync')
  }
}

async function deleteSheetRecords(sheetId: string) {
  processRecords(sheetId, async (records: Flatfile.RecordsWithLinks) => {
    try {
      if (records.length > 0) {
        const recordIds = records.map((record) => {
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
      handleError(e, `Error deleting records from sheet ${sheetId}`)
    }
  })
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
        await api.records.insert(sheetId, records, {
          compressRequestBody: true,
        })
      }
    } while (paginatedList.next)
  } catch (e) {
    console.error(e)
    // Don't fail here, this will fail the entire sync
    // throw new Error(`Error syncing ${slug} sheet`)
  }
}

function handleError(error: any, message: string) {
  console.error(error)
  throw new Error(`${message}: ${error.message}`)
}

function getMergeClient(apiKey: string, accountToken?: string) {
  return new MergeClient({
    environment: MergeEnvironment.Production,
    apiKey,
    ...(accountToken ? { accountToken } : {}),
  })
}

async function getSecret(
  spaceId: string,
  environmentId: string,
  name: string
): Promise<string | undefined> {
  try {
    const secrets = await api.secrets.list({ spaceId, environmentId })
    return secrets.data.find((secret) => secret.name === name)?.value
  } catch (e) {
    handleError(e, `Error fetching secret ${name}`)
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
        description: `${property.description}`,
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
          console.log(
            `Unhandled field '${field.label}' with property type '${property.type}'.`
          )
      }
    }

    const sheetConfigs: Flatfile.SheetConfig[] = []
    for (const [name, schema] of Object.entries(schemas)) {
      if (
        CATEGORY_MODELS[category] &&
        CATEGORY_MODELS[category].hasOwnProperty(name)
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
          slug: CATEGORY_MODELS[category][name],
          fields: fields,
        })
      }
    }

    return sheetConfigs
  } catch (error) {
    handleError(error, 'Error fetching or processing schema')
  }
}
