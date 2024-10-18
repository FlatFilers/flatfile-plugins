import type { FlatfileListener } from '@flatfile/listener'
import { llmRecordGenerator } from '@flatfile/plugin-import-llm'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    llmRecordGenerator({
      llmSecretName: 'OPENAI_API_KEY',
      model: 'gpt-4o',
      job: 'generateExampleRecords',
      numberOfRecords: 10,
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
