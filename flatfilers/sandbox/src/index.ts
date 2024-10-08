import type { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { phoneFormatValidator } from '@flatfile/plugin-validate-phone'

export default async function (listener: FlatfileListener) {
  listener.use(
    phoneFormatValidator({
      phoneField: 'phone',
      countryField: 'country',
      autoConvert: true,
    })
  )
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
