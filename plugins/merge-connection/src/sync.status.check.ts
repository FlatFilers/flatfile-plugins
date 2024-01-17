import { Merge, MergeClient } from '@mergeapi/merge-node-client'
import { fetchAllSyncStatuses } from './sync.status.fetch'
import { handleError } from './utils'

export async function checkAllSyncsComplete(
  mergeClient: MergeClient,
  category: string
) {
  try {
    const allSyncs = await fetchAllSyncStatuses(mergeClient, category)
    const syncedModels = allSyncs.filter(
      (syncStatus) =>
        syncStatus.status !== Merge[category].SyncStatusStatusEnum.Syncing
    )
    const completedSyncs = syncedModels.length
    const totalModels = allSyncs.length

    return {
      allComplete: completedSyncs === totalModels,
      completedSyncs,
      totalModels,
      syncedModels,
    }
  } catch (e) {
    handleError(e, 'Error checking sync status')
  }
}
