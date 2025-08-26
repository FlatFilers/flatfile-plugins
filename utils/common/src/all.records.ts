import { type Flatfile, FlatfileClient } from '@flatfile/api'
import { CrossEnvConfig } from '@flatfile/cross-env-config'
import fetch from 'cross-fetch'
import { asyncLimitSeries } from './async.helpers'

const api = new FlatfileClient()

const DEFAULT_PAGE_SIZE = 10_000

export async function getRecordsRaw(
  sheetId: string,
  options: Flatfile.records.GetRecordsRequest = {}
): Promise<Array<Flatfile.Record_>> {
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

  const { baseUrl, token } = getCredentials()

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

/**
 * Creates records in a sheet. Bypasses API SDK in order to suppress hooks
 */
export async function createRecords(
  sheetId: string,
  records: Flatfile.RecordData[]
): Promise<string> {
  const { baseUrl, token } = getCredentials()

  const httpResponse = await fetch(`${baseUrl}/v1/sheets/${sheetId}/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-force-hooks': 'true',
    },
    body: JSON.stringify(records),
  })

  if (!httpResponse.ok) {
    console.log(await httpResponse?.text())
    throw new Error(`Creating records failed.`)
  }
  const res = await httpResponse.json()
  return res.data.commitId
}

/**
 * Updates records in a sheet. Bypasses API SDK in order to suppress hooks
 */
export async function updateRecords(
  sheetId: string,
  records: any
): Promise<string> {
  const { baseUrl, token } = getCredentials()

  const httpResponse = await fetch(`${baseUrl}/v1/sheets/${sheetId}/records`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-force-hooks': 'true',
    },
    body: JSON.stringify(records),
  })

  if (httpResponse.status === 304) {
    return 'not-modified'
  }

  if (!httpResponse.ok) {
    console.log(await httpResponse?.text())
    throw new Error(`Updating records failed.`)
  }

  const res = await httpResponse.json()
  return res.data.commitId
}

/**
 * Updates records in a sheet. Bypasses API SDK in order to suppress hooks
 */
export async function updateAllRecords(
  sheetId: string,
  records: Flatfile.Record_[],
  tick?: TickHelper
): Promise<void> {
  const recordCount = records.length
  const pageCount = Math.ceil(recordCount / DEFAULT_PAGE_SIZE)
  await asyncLimitSeries(pageCount, async (index: number) => {
    const start = index * DEFAULT_PAGE_SIZE
    const end =
      start + DEFAULT_PAGE_SIZE <= records.length
        ? start + DEFAULT_PAGE_SIZE
        : records.length
    await tick?.((index + 1) / pageCount, index + 1, pageCount).catch(
      console.log
    )
    return updateRecords(sheetId, records.slice(index * DEFAULT_PAGE_SIZE, end))
  })
}

/**
 * Creates many records in a sheet. Bypasses API SDK in order to suppress hooks
 */
export async function createAllRecords(
  sheetId: string,
  records: Flatfile.RecordData[],
  tick?: TickHelper
): Promise<void> {
  const recordCount = records.length
  const pageCount = Math.ceil(recordCount / DEFAULT_PAGE_SIZE)
  await asyncLimitSeries(pageCount, async (index: number) => {
    const start = index * DEFAULT_PAGE_SIZE
    const end =
      start + DEFAULT_PAGE_SIZE <= records.length
        ? start + DEFAULT_PAGE_SIZE
        : records.length
    await tick?.((index + 1) / pageCount, index + 1, pageCount).catch(
      console.log
    )
    return createRecords(sheetId, records.slice(index * DEFAULT_PAGE_SIZE, end))
  })
}

export type TickHelper = (
  progress: number,
  part: number,
  totalParts: number
) => Promise<void>

function getCredentials() {
  const baseUrl =
    CrossEnvConfig.get('AGENT_INTERNAL_URL') ||
    CrossEnvConfig.get('FLATFILE_API_URL') ||
    'https://platform.flatfile.com/api'
  const token =
    CrossEnvConfig.get('FLATFILE_BEARER_TOKEN') ||
    CrossEnvConfig.get('FLATFILE_API_KEY')

  return { baseUrl, token }
}
