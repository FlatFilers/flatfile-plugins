import type { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { dateFormatNormalizer } from '@flatfile/plugin-validate-date'

export default async function (listener: FlatfileListener) {
  listener.use(
    dateFormatNormalizer({
      sheetSlug: 'contacts',
      dateFields: ['dob', 'hire_date'],
      outputFormat: 'MM/dd/yyyy',
      includeTime: true,
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
                {
                  key: 'dob',
                  type: 'string',
                  label: 'Date of Birth',
                },
                {
                  key: 'hire_date',
                  type: 'string',
                  label: 'Hire Date',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
