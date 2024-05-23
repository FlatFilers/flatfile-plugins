import type { Flatfile } from '@flatfile/api'
import type {
  IRawRecord,
  TPrimitive,
  TRecordData,
  TRecordDataWithLinks,
} from '@flatfile/hooks'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'

/**
 * RecordTranslator is a class that translates between FlatfileRecord or Flatfile.RecordWithLinks types.
 * It provides methods to convert records to FlatfileRecords or Flatfile.RecordsWithLinks.
 */
export class RecordTranslator<
  T extends FlatfileRecord | Flatfile.RecordWithLinks,
> {
  /**
   * Constructor for RecordTranslator.
   * @param records - An array of FlatfileRecord or Flatfile.RecordWithLinks.
   */
  constructor(private readonly records: T[]) {
    this.records = records
  }

  /**
   * Converts the records to FlatfileRecords.
   * @returns FlatfileRecords<any> - The converted FlatfileRecords.
   */
  toFlatfileRecords = (): FlatfileRecords<any> => {
    if (this.records instanceof FlatfileRecords) {
      // If the records are already FlatfileRecords, return them directly
      return this.records
    } else {
      // Convert Flatfile.RecordWithLinks to FlatfileRecords
      const XRecords = this.records as Flatfile.RecordWithLinks[]

      const FFRecords = new FlatfileRecords(
        XRecords.map((record: Flatfile.RecordWithLinks) => {
          let rawData: TRecordDataWithLinks = {}
          for (let [k, v] of Object.entries(record.values)) {
            if (!!v.links?.length && v.value) {
              // Handle linked records
              const links = v.links.map((link) => {
                let linkedRawData: TRecordData = {}
                for (let [lk, lv] of Object.entries(link.values)) {
                  linkedRawData[lk] = lv.value as TPrimitive
                }
                return linkedRawData
              })
              rawData[k] = {
                value: v.value as TPrimitive,
                links,
              }
            } else {
              // Handle non-linked records
              rawData[k] = v.value as TPrimitive
            }
          }
          const metadata = record.metadata
          const rawRecord = {
            rowId: record.id,
            rawData,
            metadata,
          } as IRawRecord

          return rawRecord
        })
      )
      return FFRecords
    }
  }

  /**
   * Converts the records to Flatfile.RecordsWithLinks.
   * @returns Flatfile.RecordsWithLinks - The converted Flatfile.RecordsWithLinks.
   */
  toXRecords = (): Flatfile.RecordsWithLinks => {
    if (this.records[0] instanceof FlatfileRecord) {
      // Convert FlatfileRecord to Flatfile.RecordsWithLinks
      const FFRecords = this.records as FlatfileRecord[]
      return FFRecords.map((record: FlatfileRecord) => {
        const recordWithInfo = record.toJSON()
        let values: any = {}
        for (let [k, v] of Object.entries(recordWithInfo.row.rawData)) {
          const messages = recordWithInfo.info
            .filter((info) => info.field === k)
            .map((info) => ({
              message: info.message,
              type: info.level,
              source: 'custom-logic',
            }))

          values[k] = {
            value: v !== null && typeof v === 'object' ? v.value : v,
            messages: messages,
            valid: true,
          }
        }
        const metadata = recordWithInfo.row.metadata
        const config = recordWithInfo.config
        return {
          id: String(record.rowId),
          values,
          metadata,
          config,
        }
      }) as Flatfile.RecordsWithLinks
    } else {
      // If the records are already Flatfile.RecordsWithLinks, return them directly
      return this.records as Flatfile.RecordsWithLinks
    }
  }
}
