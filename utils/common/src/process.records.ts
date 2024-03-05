import api, { Flatfile } from '@flatfile/api'

export async function processRecords<R>(
  sheetId: string,
  callback: (
    records: Flatfile.RecordsWithLinks,
    pageNumber?: number
  ) => R | void | Promise<R | void>,
  getRecordsRequest?: GetRecordsRequest
): Promise<R[] | void> {
  let pageNumber = 1
  const results: R[] = []

  while (true) {
    const {
      data: { records },
    } = await api.records.get(sheetId, {
      ...getRecordsRequest,
      pageNumber: pageNumber++,
    })

    const result = await callback(records, pageNumber - 1)
    if (result !== undefined && result !== null) {
      results.push(result as R)
    }

    if (records.length === 0) {
      break
    }
  }

  return results.length ? results : undefined
}

export type GetRecordsRequest = Omit<
  Flatfile.records.GetRecordsRequest,
  'pageNumber'
>
