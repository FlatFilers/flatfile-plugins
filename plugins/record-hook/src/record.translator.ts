import {
  FlatfileRecord,
  FlatfileRecords,
  IRawRecord,
  TPrimitive,
  TRecordData,
  TRecordDataWithLinks,
} from '@flatfile/hooks'

import type { Flatfile } from '@flatfile/api'

export class RecordTranslator<
  T extends FlatfileRecord | Flatfile.RecordWithLinks
> {
  constructor(private readonly records: T[]) {
    this.records = records
  }

  toFlatFileRecords = () => {
    if (this.records instanceof FlatfileRecords) {
      return this.records as FlatfileRecords<any>
    } else {
      const XRecords = this.records as Flatfile.RecordWithLinks[]

      const FFRecords = new FlatfileRecords(
        XRecords.map((record: Flatfile.RecordWithLinks) => {
          let rawData: TRecordDataWithLinks = {}
          for (let [k, v] of Object.entries(record.values)) {
            if (!!v.links?.length && v.value) {
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
      return FFRecords as FlatfileRecords<any>
    }
  }

  toXRecords = () => {
    if (this.records[0] instanceof FlatfileRecord) {
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
        return {
          id: String(record.rowId),
          values,
          metadata,
        }
      })
    } else {
      return this.records as Flatfile.Record_[]
    }
  }
}
