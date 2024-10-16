import type { FlatfileListener } from '@flatfile/listener'
import { pivotTablePlugin } from '@flatfile/plugin-export-pivot-table'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    pivotTablePlugin({
      pivotColumn: 'product',
      aggregateColumn: 'salesAmount',
      aggregationMethod: 'sum',
      groupByColumn: 'region',
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
            },
          ],
          actions: [
            {
              operation: 'generatePivotTable',
              label: 'Generate Pivot Table',
              description:
                'This custom action code generates a pivot table from the records in the People sheet.',
              primary: false,
              mode: 'foreground',
              type: 'string',
            },
          ],
        },
      ],
    })
  )
}
