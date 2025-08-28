import type { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { contacts } from './sheets/contacts'
import '@flatfile/http-logger/init'
import api, { type Flatfile } from '@flatfile/api'
import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'
import { foreignDBExtractor } from '@flatfile/plugin-foreign-db-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(foreignDBExtractor())
  // First: Cache the sheets to avoid excessive API calls
  listener.on('job:ready', { job: 'workbook:downloadWorkbook' }, async (e) => {
    await e.cache.init('sheets-schema', async () => {
      const { data } = await api.sheets.list({
        workbookId: e.context.workbookId,
      })
      return data
    })
  })
  // Then: Export workbook
  listener.use(
    exportWorkbookPlugin({
      autoDownload: true,
      columnNameTransformer: async (columnName, sheetSlug, e) => {
        try {
          // Get all sheets for the workbook
          const sheets = await e?.cache.get<Flatfile.Sheet[]>('sheets-schema')
          if (!sheets) {
            return columnName
          }

          const sheet = sheets.find((s) => s.slug === sheetSlug)
          if (!sheet) {
            return columnName
          }

          if (sheet?.config?.fields) {
            // Find the field with the matching key
            const field = sheet.config.fields.find((f) => f.key === columnName)

            // Return the label if found, otherwise return the original column name
            return field ? field.label : columnName
          }

          return columnName
        } catch (error) {
          console.error('Error accessing field configuration:', error)
          return columnName
        }
      },
    })
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [contacts],
          actions: [
            {
              operation: 'downloadWorkbook',
              mode: 'foreground',
              label: 'Download Workbook',
              description: 'Download the workbook as an Excel file',
              primary: true,
            },
          ],
        },
      ],
    })
  )
}
