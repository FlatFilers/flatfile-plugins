import type { Workbook } from '@flatfile/configure'
import type { Client } from '@flatfile/listener'
import api from '@flatfile/api'

export const dxpConfigure = (workbook: Workbook) => {
  return (client: Client) => {
    client.on('**', (event) => {
      // @ts-ignore
      return workbook.routeEvent(event.src) // event.src is a private property but js doesn't care
    })

    client.on(
      'job:created',
      // @ts-ignore
      { payload: { operation: 'configure' } }, // this filter isn't typed right yet
      async (event) => {
        const { spaceId, environmentId, jobId } = event.context
        await api.jobs.update(jobId, {
          status: 'executing',
        })

        const src = workbook.options.sheets

        const sheets = Object.keys(src)
          .map((key) => src[key].toBlueprint(workbook.options.namespace, key))
          .map((sheet) => ({ ...sheet, actions: sheet.actions || [] }))

        await api.workbooks.create({
          spaceId: spaceId,
          environmentId: environmentId,
          name: workbook.options.name,
          sheets,
        })

        await api.jobs.update(jobId, {
          status: 'complete',
        })
      }
    )
  }
}
