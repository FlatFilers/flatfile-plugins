import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  bulkRecordHook,
  type FlatfileRecord,
} from '@flatfile/plugin-record-hook'
import { recordHookStream } from '@flatfile/plugin-record-hook-stream'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { contactsSheet, oneHundredSheet } from '../../playground/src/blueprints'

export default async function (listener: FlatfileListener) {
  // listener.use(
  //   bulkRecordHook(
  //     '**',
  //     (records: FlatfileRecord[], event: FlatfileEvent) => {
  //       for (const record of records) {
  //         for (const field of oneHundredSheet.fields) {
  //           record.addError(field.key, 'Testing streaming')
  //         }
  //         // record.addError('one', 'Testing streaming')
  //       }
  //       return records
  //     },
  //     { debug: true }
  //   )
  // )
  listener.use(
    recordHookStream(
      '**',
      (records, event: FlatfileEvent) => {
        for (const record of records) {
          for (const field of oneHundredSheet.fields) {
            record.err(field.key, 'Testing something')
          }
        }
        return records
      },
      { includeMessages: true, debug: true }
    )
  )
  listener.use(
    configureSpace({
      workbooks: [
        // {
        //   name: 'Sandbox',
        //   sheets: [
        //     contactsSheet,
        //   ],
        // },
        oneHundredSheet,
      ],
    })
  )
}
