import { Flatfile } from '@flatfile/api'

const PAGE_SIZE = 5_000

export async function processRecords<R>(
  sheetId: string,
  callback: (
    records: Flatfile.RecordsWithLinks,
    pageNumber?: number
  ) => R | void | Promise<R | void>,
  getRecordsRequest?: GetRecordsRequest
): Promise<R[] | void> {
  let pageNumber = 0
  const results: R[] = []

  while (true) {
    pageNumber++
    const records = await getRecordsRaw(sheetId, {
      ...getRecordsRequest,
      pageNumber: pageNumber,
    })

    const result = await callback(records, pageNumber)
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

export async function getRecordsRaw(
  sheetId: string,
  options: Flatfile.records.GetRecordsRequest = {}
): Promise<Array<Flatfile.Record_>> {
  const pageNumber = String(options.pageNumber || 1)
  const pageSize = String(options.pageSize || PAGE_SIZE)
  // @ts-ignore
  const query = new URLSearchParams({ ...options, pageNumber, pageSize })
  const baseUrl = `${
    process.env.FLATFILE_API_URL || process.env.AGENT_INTERNAL_URL
  }/v1/sheets/${sheetId}/records`

  const httpResponse = await fetch(`${baseUrl}?${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${
        process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN
      }`,
      'Content-Type': 'application/json',
    },
  })

  if (!httpResponse.ok) {
    throw new Error(`Reading ${pageNumber} of ${sheetId} failed.`)
  }

  try {
    const res = await httpResponse.json()
    return res.data?.records ? res.data.records : []
  } catch (e) {
    console.log(e)
    return []
  }
}
