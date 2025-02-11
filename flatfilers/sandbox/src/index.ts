import type { FlatfileListener } from '@flatfile/listener'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { storedConstraint } from '@flatfile/plugin-stored-constraints'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { contacts } from './sheets/contacts'

export default async function (listener: FlatfileListener) {
  listener.use(storedConstraint())
  listener.use(
    ExcelExtractor({
      rawNumbers: true,
      headerDetectionOptions: {
        algorithm: 'dataRowAndSubHeaderDetection',
      },
    })
  )

  listener.use(
    bulkRecordHook(
      'contacts',
      async (records) => {
        try {
          let firstRecord = records[0]
          firstRecord.set('lastName', 'Jane')
          return records
        } catch (error) {
          throw error
        }
      },
      { debug: true }
    )
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [contacts],
          actions: [
            {
              operation: 'export-delimited-zip',
              label: 'Export to Delimited ZIP',
              mode: 'foreground',
            },
          ],
        },
      ],
    })
  )
}
