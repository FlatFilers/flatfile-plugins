import { Flatfile } from '@flatfile/api'
import {
  createAllRecords,
  getRecordsRaw,
  getSheetLength,
  TickHelper,
  updateAllRecords,
} from './all.records'
import { asyncLimitSeries } from './async.helpers'

const PAGE_SIZE = 2000

export class Simplified {
  /**
   * Return all records for a sheet
   *
   * @param sheetId
   * @param options
   * @param tick
   */
  static async getAllRecords(
    sheetId: string,
    options: Flatfile.records.GetRecordsRequest = {},
    tick?: TickHelper
  ): Promise<SimpleRecord[]> {
    const recordCount = await getSheetLength(sheetId)
    const pageSize = options.pageSize || PAGE_SIZE
    const pageCount = Math.ceil(recordCount / pageSize)

    const recordPages = await asyncLimitSeries(pageCount, async (i: number) => {
      await tick?.((i + 1) / pageCount, i + 1, pageCount).catch(console.log)
      const res = await getRecordsRaw(sheetId, {
        ...options,
        pageNumber: i + 1,
        pageSize,
      })
      return res.map(Simplified.toSimpleRecord)
    })
    return recordPages.flat(1)
  }

  /**
   * Return all records for a sheet by iterating until there are empty pages.
   * This is most useful in scenarios where pages are generally small but you want
   * to safely handle edge cases. It avoids another count request.
   *
   * @param sheetId
   * @param options
   */
  static async getAllRecordsSeries(
    sheetId: string,
    options: Flatfile.records.GetRecordsRequest = {}
  ): Promise<SimpleRecord[]> {
    const pageSize = options.pageSize || PAGE_SIZE

    const recordPages: SimpleRecord[][] = []
    let pageNumber = 1
    while (true) {
      const res = await getRecordsRaw(sheetId, {
        ...options,
        pageSize,
        pageNumber,
      })

      recordPages.push(res.map(Simplified.toSimpleRecord))
      pageNumber += 1
      if (res.length < pageSize) {
        break
      }
    }

    return recordPages.flat(1)
  }

  static async findRecordsLimit(
    sheetId: string,
    options: Flatfile.records.GetRecordsRequest,
    limit = 100
  ) {
    const records = await getRecordsRaw(sheetId, {
      ...options,
      pageSize: limit,
      pageNumber: 1,
    })
    if (Array.isArray(records)) {
      return records.map(Simplified.toSimpleRecord)
    }
    return []
  }

  /**
   * { foo: bar } => { foo : {value: bar}}
   * @param obj
   */
  static toRecordValues(obj: SimpleRecord): Flatfile.RecordData {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => key !== '_id' && key !== '_metadata')
        .map(([key, value]) => [key, { value: value as Primitive }])
    )
  }

  static toStandardRecord(obj: SimpleRecord) {
    return {
      id: obj._id as string,
      metadata: obj._metadata as any,
      values: Simplified.toRecordValues(obj),
    }
  }

  /**
   *
   * @param r
   */
  static toSimpleRecord(r: Flatfile.Record_): SimpleRecord {
    const obj = Object.fromEntries(
      Object.entries(r.values).map(
        ([key, value]) => [key, value.value] as [string, any]
      )
    )
    obj.id = r.id
    return obj as SimpleRecord
  }

  static updateAllRecords(
    sheetId: string,
    records: SimpleRecord[],
    tick?: TickHelper
  ): Promise<void> {
    return updateAllRecords(
      sheetId,
      records.map(Simplified.toStandardRecord),
      tick
    )
  }

  static async createAllRecords(
    sheetId: string,
    records: SimpleValues[],
    tick?: TickHelper
  ): Promise<void> {
    await createAllRecords(
      sheetId,
      records.map(Simplified.toRecordValues),
      tick
    )
  }
}

export type Primitive = string | number | null | boolean

export type SimpleRecord = {
  _id: string
  _metadata?: Record<string, any>
} & SimpleValues
export type SimpleValues = { [key: string]: Primitive }
