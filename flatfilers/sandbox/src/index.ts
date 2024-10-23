import type { FlatfileListener } from '@flatfile/listener'
import { exportToExternalAPIPlugin } from '@flatfile/plugin-export-external-api'
import { configureSpace } from '@flatfile/plugin-space-configure'
export default async function (listener: FlatfileListener) {
  listener.use(
    exportToExternalAPIPlugin({
      job: 'export-external-api',
      apiEndpoint: 'http://localhost:5678/api/import',
      secretName: 'EXTERNAL_API_AUTH_SECRET',
      batchSize: 100,
      maxRetries: 3,
      retryDelay: 1000,
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
                  operation: 'export-external-api',
                  label: 'Export to External API',
                  description:
                    'This custom action code exports the records in the Sales sheet to an external API.',
                  primary: false,
                  mode: 'foreground',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
