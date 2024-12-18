import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'
import { MERGE_ACCESS_KEY } from './config'
import { waitForMergeSync } from './poll.for.merge.sync'
import { syncData } from './sync.data'
import { getMergeClient, getSecret, handleError } from './utils'

const api = new FlatfileClient()

export function handleConnectedWorkbookSync() {
  return async (event: FlatfileEvent, tick: FlatfileTickFunction) => {
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
        const slug = sheet.config.slug!
        await syncData(mergeClient, sheet.id, category, slug)
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
