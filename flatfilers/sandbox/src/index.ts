import type { FlatfileListener } from '@flatfile/listener'
import { pdfGeneratorPlugin } from '@flatfile/plugin-export-pdf'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(pdfGeneratorPlugin())
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
                  type: 'date',
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
                  key: 'sales_amount',
                  type: 'number',
                  label: 'Sales Amount',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
