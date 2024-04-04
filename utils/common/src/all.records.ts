import api, { Flatfile } from '@flatfile/api'
import { CrossEnvConfig } from '@flatfile/cross-env-config'
import fetch from 'cross-fetch'

const DEFAULT_PAGE_SIZE = 10_000

export async function getRecordsRaw(
  sheetId: string,
  options: Flatfile.records.GetRecordsRequest = {}
): Promise<Array<Flatfile.Record_> | Error> {
  const queryParams = new URLSearchParams()
  queryParams.set('pageNumber', String(options.pageNumber ?? 1))
  queryParams.set('pageSize', String(options.pageSize ?? DEFAULT_PAGE_SIZE))

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.map((v) => queryParams.append(key, String(v)))
      } else {
        queryParams.set(key, String(value))
      }
    }
  })

  const baseUrl =
    CrossEnvConfig.get('AGENT_INTERNAL_URL') ||
    CrossEnvConfig.get('FLATFILE_API_URL') ||
    'https://platform.flatfile.com/api'
  const token =
    CrossEnvConfig.get('FLATFILE_BEARER_TOKEN') ||
    CrossEnvConfig.get('FLATFILE_API_KEY')

  const url = `${baseUrl}/v1/sheets/${sheetId}/records?${queryParams}`
  const httpResponse = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!httpResponse.ok) {
    throw new Error(`Reading ${options.pageNumber ?? 1} of ${sheetId} failed.`)
  }

  try {
    const res = await httpResponse.json()
    return res.data?.records ?? []
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
  options: Omit<Flatfile.records.GetRecordsRequest, 'pageNumber'> = {}
): Promise<R[] | void> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const totalRecords = await getSheetLength(sheetId)
  const totalPageCount = Math.ceil(totalRecords / pageSize) || 1
  const results: R[] = []

  for (let pageNumber = 1; pageNumber <= totalPageCount; pageNumber++) {
    try {
      const records = (await getRecordsRaw(sheetId, {
        ...options,
        pageSize,
        pageNumber,
      })) as Flatfile.Record_[]

      // Delete updatedAt
      records.forEach((record) =>
        Object.values(record.values).forEach(
          (value: Record<string, Flatfile.CellValue>) => delete value.updatedAt
        )
      )

      const result = await callback(records, pageNumber, totalPageCount)
      if (result !== undefined && result !== null) {
        results.push(result as R)
      }
    } catch (e) {
      // log error and continue processing
      console.error(e)
    }
  }

  return results.length ? results : undefined
}
