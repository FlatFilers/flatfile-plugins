import api, { Flatfile } from '@flatfile/api'

export async function processRecords<R>(
  sheetId: string,
  callback: (records: Flatfile.RecordsWithLinks) => Promise<R | void>,
  recordGetOptions?: Omit<Flatfile.records.GetRecordsRequest, 'pageNumber'>
): Promise<R[] | void> {
  let pageNumber = 1
  const results: R[] = []

  while (true) {
    const {
      data: { records },
    } = await api.records.get(sheetId, {
      ...recordGetOptions,
      pageNumber: pageNumber++,
    })

    if (records.length === 0) {
      break
    }

    const result = await callback(records)
    if (result !== undefined && result !== null) {
      results.push(result as R)
    }
  }

  return results.length ? results : undefined
}
