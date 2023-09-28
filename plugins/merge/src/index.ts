import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { MergeClient, MergeEnvironment } from '@mergeapi/merge-node-client'
import { mergeSheets } from './blueprint'

const MERGE_ACCESS_KEY = 'MERGE_TEST_ACCESS_KEY'
const MERGE_X_ACCOUNT_TOKEN = 'MERGE_X_ACCOUNT_TOKEN'

export default function mergePlugin(category: string) {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        'workbook:retrieveAccountToken',
        retrieveAccountTokenHandler(category)
      )
    )
    listener.use(
      //workbook:createConnectedWorkbook
      jobHandler('workbook:submitActionFg', handleSyncAction(category))
    )
    listener.use(
      jobHandler(
        'workbook:syncConnectedWorkbook',
        handleConnectedWorkbookSync(category)
      )
    )
  }
}

function retrieveAccountTokenHandler(category: string) {
  return async (event: FlatfileEvent) => {
    const { spaceId, environmentId, publicToken } = event.context
    const apiKey = await getSpaceEnvSecret(
      spaceId,
      environmentId,
      MERGE_ACCESS_KEY
    )
    const mergeClient = new MergeClient({
      environment: MergeEnvironment.Production,
      apiKey,
    })
    const { accountToken } = await mergeClient[category].accountToken.retrieve(
      publicToken
    )
    await api.secrets.upsert({
      name: MERGE_X_ACCOUNT_TOKEN,
      value: accountToken,
      environmentId,
      spaceId,
    })
    return { info: 'Account token retrieved!' }
  }
}

function handleSyncAction(category: string) {
  return async (event: FlatfileEvent) => {
    const { spaceId, environmentId } = event.context
    const merge = await getMergeClient(spaceId, environmentId)
    const sheets = mergeSheets[category]
    const accountDetails = await merge[category].accountDetails.retrieve()

    const { data: workbook } = await api.workbooks.create({
      spaceId,
      environmentId,
      name: accountDetails.integration,
      sheets,
      // Todo: set metadata/connection
    })

    await api.jobs.create({
      type: 'workbook',
      operation: 'syncConnectedWorkbook',
      status: 'ready',
      source: workbook.id,
      trigger: 'immediate',
    })

    return { info: 'Merge workbook created!' }
  }
}

function handleConnectedWorkbookSync(category: string) {
  return async (event: FlatfileEvent) => {
    const { spaceId, workbookId, environmentId } = event.context
    const merge = await getMergeClient(spaceId, environmentId)
    // const { data: workbook } = await api.workbooks.get(workbookId)
    // const workbookMetadata = workbook.metadata
    const { data: sheets } = await api.sheets.list({ workbookId })

    for (const sheet of sheets) {
      await syncData(
        merge[category][sheet.config.slug],
        sheet.id,
        'todo: last_synced_at' //TODO: get last_synced_at from workbook metadata
      )
    }
    // TODO: update workbook/metadata/connection/last_synced_at

    return { info: 'Synced!' }
  }
}

async function syncData(model, sheetId: string, lastSyncedAt: string) {
  let paginatedList
  do {
    paginatedList = await model.list({ cursor: paginatedList?.next }) // TODO: pass modified_after:last_synced_at
    const records = mapRecords(paginatedList.results)
    if (records.length > 0) {
      await api.records.insert(sheetId, records)
    }
  } while (paginatedList.next)
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

async function getMergeClient(
  spaceId: string,
  environmentId: string
): Promise<MergeClient> {
  const apiKey = await getSpaceEnvSecret(
    spaceId,
    environmentId,
    MERGE_ACCESS_KEY
  )
  const accountToken = await getSpaceEnvSecret(
    spaceId,
    environmentId,
    MERGE_X_ACCOUNT_TOKEN
  )

  if (!apiKey || !accountToken) {
    throw new Error('Missing Merge API key or account token')
  }

  return new MergeClient({
    environment: MergeEnvironment.Production,
    apiKey,
    accountToken,
  })
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
