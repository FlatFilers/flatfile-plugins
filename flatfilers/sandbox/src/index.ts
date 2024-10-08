import type { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { viewMappedPlugin } from '@flatfile/plugin-view-mapped'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { emailValidationPlugin } from '@flatfile/plugin-validate-email'


export default async function (listener: FlatfileListener) {
  listener.use(viewMappedPlugin())
  
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Contacts',
              slug: 'contacts',
              allowAdditionalFields: true,
              fields: [
                {
                  key: 'firstName',
                  type: 'string',
                  label: 'First Name',
                },
                {
                  key: 'lastName',
                  type: 'string',
                  label: 'Last Name',
                },
                {
                  key: 'email',
                  type: 'string',
                  label: 'Email',
                },
                {
                  key: 'phone',
                  type: 'string',
                  label: 'Phone',
                },
                {
                  key: 'country',
                  type: 'string',
                  label: 'Country',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
