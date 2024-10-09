import type { FlatfileListener } from '@flatfile/listener'
import { exportPdfPlugin } from '@flatfile/plugin-export-pdf'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(exportPdfPlugin({ jobName: 'generatePDFReport' }))

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
              actions: [
                {
                  operation: 'generatePDFReport',
                  mode: 'foreground',
                  label: 'Export PDF',
                  description: 'Export this sheet as a PDF.',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
