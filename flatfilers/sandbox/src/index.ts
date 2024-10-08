import type { FlatfileListener } from '@flatfile/listener'
<<<<<<< HEAD
=======
import { emailValidationPlugin } from '@flatfile/plugin-email-validation'
>>>>>>> 8c84ceb (cleanup)
import { configureSpace } from '@flatfile/plugin-space-configure'
import { viewMappedPlugin } from '@flatfile/plugin-view-mapped'

export default async function (listener: FlatfileListener) {
<<<<<<< HEAD
  listener.use(viewMappedPlugin())
  
=======
  listener.use(
    emailValidationPlugin({
      emailFields: ['email'],
    })
  )
>>>>>>> 8c84ceb (cleanup)
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
