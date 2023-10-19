import api, { Flatfile } from '@flatfile/api'

export async function processRecords<R>(
  sheetId: string,
  callback: (records: Flatfile.RecordsWithLinks) => R,
  recordGetOptions?: Omit<Flatfile.records.GetRecordsRequest, 'pageNumber'>
): Promise<R[]> {
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

    const result = callback(records)
    results.push(result)
  }

  return results
}
