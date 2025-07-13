import type { FlatfileRecord } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import {
  configureSpace,
  dataChecklist,
  dataChecklistPlugin,
} from '@flatfile/plugin-space-configure'
import { viewMappedPlugin } from '@flatfile/plugin-view-mapped'
import { contacts } from './sheets/contacts'
import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { pdfExtractorPlugin } from '@flatfile/plugin-pdf-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook(
      'contacts',
      async (records: FlatfileRecord[], event: FlatfileEvent) => {
        // TODO: Add your logic here
        records.map((record) => {
          record.set('firstName', 'John')
        })
        return records
      },
      { debug: true }
    )
  )
  listener.use(
    ExcelExtractor({
      debug: true,
      headerDetectionOptions: { algorithm: 'aiDetection' },
    })
  )
  listener.use(pdfExtractorPlugin({ apiKey: '' }))
  listener.use(viewMappedPlugin({ keepRequiredFields: true }))
  listener.use(exportWorkbookPlugin({ excludeMessages: false }))
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
