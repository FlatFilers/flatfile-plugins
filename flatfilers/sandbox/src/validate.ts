import type { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { validateIsbn } from '@flatfile/plugin-validate-isbn'

export default async function (listener: FlatfileListener) {
  listener.use(validateIsbn({
    autoFormat: true,
  }))

  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Books',
              slug: 'books',
              fields: [
                {
                  key: 'name',
                  type: 'string',
                  label: 'Name',
                },
                {
                  key: 'isbn',
                  type: 'string',
                  label: 'ISBN',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
