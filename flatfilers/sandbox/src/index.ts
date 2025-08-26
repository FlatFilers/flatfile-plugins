import type { FlatfileRecord } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { ExcelExtractor } from "@flatfile/plugin-xlsx-extractor";
import { foreignDBExtractor } from '@flatfile/plugin-foreign-db-extractor'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { contacts } from './sheets/contacts'
import '@flatfile/http-logger/init'

export default async function (listener: FlatfileListener) {
  listener.use(ExcelExtractor())
  listener.use(foreignDBExtractor())
  listener.use(
    bulkRecordHook(
      'contacts',
      async (records: FlatfileRecord[], _event: FlatfileEvent) => {
        records.forEach((record) => {
          record.set('firstName', 'John')
        })
        return records
      }
    )
  )
  listener.use(
    configureSpace(
      {
        workbooks: [
          {
            name: 'Sandbox',
            sheets: [contacts],
            actions: [
              {
                operation: 'downloadWorkbook',
                mode: 'foreground',
                label: 'Submit data',
                description: 'Action for handling data inside of onSubmit',
                primary: true,
              },
            ],
            settings: {
              trackChanges: true,
            },
          },
        ],
      }
      // async (event: FlatfileEvent) => {
      //   You can use the `dataChecklist` function to create a data checklist in this callback or you can use
      //   the `dataChecklistPlugin` to create a data checklist if you're not using the `configureSpace` plugin
      //   await dataChecklist(event.context.spaceId)
      // }
    )
  )
}
