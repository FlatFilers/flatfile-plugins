import { MergeClient } from '@mergeapi/merge-node-client'

export async function fetchAllSyncStatuses(
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
