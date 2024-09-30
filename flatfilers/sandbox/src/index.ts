import type { FlatfileListener } from '@flatfile/listener'
import { summarizationPlugin } from '@flatfile/plugin-enrich-summarize'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    summarizationPlugin({
      sheetSlug: 'summarization',
      contentField: 'content',
      summaryField: 'summary',
      keyPhrasesField: 'keyPhrases',
    })
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Summarization',
              slug: 'summarization',
              fields: [
                {
                  key: 'content',
                  type: 'string',
                  label: 'Content',
                },
                {
                  key: 'summary',
                  type: 'string',
                  label: 'Summary',
                },
                {
                  key: 'keyPhrases',
                  type: 'string',
                  label: 'Key Phrases',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
