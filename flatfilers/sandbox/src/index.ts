import type { FlatfileListener } from '@flatfile/listener'
import { exportPDF } from '@flatfile/plugin-export-pdf'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.on('job:completed', { job: 'file:extract*' }, async (event) => {
    const { fileId } = event.context
    const { data: file } = await api.files.get(fileId)

    const isFileNameMatch = (file: Flatfile.File_): boolean => {
      const { matchFilename: regex } = this.options

      if (R.isNil(regex)) {
        // allow mapping to continue b/c we weren't explicitly told not to
        return true
      } else {
        if (regex.global) {
          regex.lastIndex = 0
        }
        return regex.test(file.name)
      }
    }

    if (!this.isFileNameMatch(file)) {
      //create new job
    }
  })

  listener.use(exportPDF())

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
