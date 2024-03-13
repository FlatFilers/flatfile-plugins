import api, { Flatfile } from '@flatfile/api'
import fetch from 'cross-fetch'

const DEFAULT_PAGE_SIZE = 10_000

export async function getRecordsRaw(
  sheetId: string,
  options: Flatfile.records.GetRecordsRequest = {}
): Promise<Array<Flatfile.Record_>> {
  const pageNumber = String(options.pageNumber ?? 1)
  const pageSize = String(options.pageSize ?? DEFAULT_PAGE_SIZE)
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

export async function getSheetLength(sheetId: string): Promise<number> {
  const {
    data: { counts },
  } = await api.sheets.getRecordCounts(sheetId)
  return counts.total
}

export async function processRecords<R>(
  sheetId: string,
  callback: (
    records: Flatfile.RecordsWithLinks,
    pageNumber?: number,
    totalPageCount?: number
  ) => R | void | Promise<R | void>,
  options?: Omit<Flatfile.records.GetRecordsRequest, 'pageNumber'>
): Promise<R[] | void> {
  options = options || {}
  options.pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE
  const totalRecords = await getSheetLength(sheetId)
  const totalPageCount = Math.ceil(totalRecords / options.pageSize) || 1
  const results: R[] = []

  let pageNumber = 0
  while (pageNumber < totalPageCount) {
    pageNumber++
    const records = await getRecordsRaw(sheetId, {
      ...options,
      pageNumber: pageNumber,
    })

    const result = await callback(records, pageNumber, totalPageCount)
    if (result !== undefined && result !== null) {
      results.push(result as R)
    }
  }

  return results.length ? results : undefined
}
