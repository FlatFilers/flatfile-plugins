import type { FlatfileListener } from '@flatfile/listener'
import { exportDelimitedZip } from '@flatfile/plugin-export-delimited-zip'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    exportDelimitedZip({
      job: 'export-delimited-zip',
      delimiter: '\t',
      fileExtension: 'tsv',
      debug: true,
    })
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Sales',
              slug: 'sales',
              fields: [
                {
                  key: 'date',
                  type: 'string',
                  label: 'Date',
                },
                {
                  key: 'product',
                  type: 'string',
                  label: 'Product',
                },
                {
                  key: 'category',
                  type: 'string',
                  label: 'Category',
                },
                {
                  key: 'region',
                  type: 'string',
                  label: 'Region',
                },
                {
                  key: 'salesAmount',
                  type: 'number',
                  label: 'Sales Amount',
                },
              ],
              actions: [
                {
                  operation: 'generateExampleRecords',
                  label: 'Generate Example Records',
                  description:
                    'This custom action code generates example records using Anthropic.',
                  primary: false,
                  mode: 'foreground',
                },
              ],
            },
            {
              name: 'Sales 2',
              slug: 'sales-2',
              fields: [
                {
                  key: 'date',
                  type: 'string',
                  label: 'Date',
                },
                {
                  key: 'product',
                  type: 'string',
                  label: 'Product',
                },
                {
                  key: 'category',
                  type: 'string',
                  label: 'Category',
                },
                {
                  key: 'region',
                  type: 'string',
                  label: 'Region',
                },
                {
                  key: 'salesAmount',
                  type: 'number',
                  label: 'Sales Amount',
                },
              ],
              actions: [
                {
                  operation: 'export-external-api',
                  label: 'Export to External API',
                  description:
                    'This custom action code exports the records in the Sales sheet to an external API.',
                  primary: false,
                  mode: 'foreground',
                },
              ],
            },
          ],
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
