import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { asyncBatch } from '@flatfile/util-common'
import {
  Merge,
  MergeClient,
  MergeEnvironment,
} from '@mergeapi/merge-node-client'
import { mergeSheets } from './blueprint'

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

    const sheets = mergeSheets[category]
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
      console.log(slug, records.length)
      if (records.length > 0) {
        await api.records.insert(sheetId, records)
      }
    } while (paginatedList.next)
  } catch (e) {
    console.error(e)
    throw new Error(`Error syncing ${slug} sheet`)
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
