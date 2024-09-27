import type { FlatfileListener } from '@flatfile/listener'
import { companyValidationPlugin } from '@flatfile/plugin-company-validator'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    companyValidationPlugin({
      sheetSlug: 'companies',
      validateAddress: true,
      validateEIN: true,
    })
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Companies',
              slug: 'companies',
              fields: [
                {
                  key: 'company_name',
                  type: 'string',
                  label: 'Name',
                },
                {
                  key: 'company_website',
                  type: 'string',
                  label: 'Website',
                },
                {
                  key: 'company_address',
                  type: 'string',
                  label: 'Address',
                },
                {
                  key: 'company_ein',
                  type: 'string',
                  label: 'EIN',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
