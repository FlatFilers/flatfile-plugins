import api from '@flatfile/api'
import type { Workbook } from '@flatfile/configure'
import type { FlatfileListener } from '@flatfile/listener'
import { shimTarget } from './shim.target'

export const dxpConfigure = (workbook: Workbook) => {
  return (listener: FlatfileListener) => {
    listener.on('**', (event) => {
      // @ts-ignore
      const newEvent = { ...event.src, target: shimTarget(event.src) }
      // @ts-ignore
      return workbook.routeEvent(newEvent) // event.src is a private property but js doesn't care
    })

    listener.on('job:ready', { job: 'space:configure' }, async (event) => {
      const { spaceId, environmentId, jobId } = event.context
      await api.jobs.ack(jobId, {
        info: 'Configuring...',
      })

      const {
        name,
        namespace,
        settings,
        sheets: originalSheets,
      } = workbook.options

      const sheets = Object.keys(originalSheets)
        .map((key) => originalSheets[key].toBlueprint(namespace, key))
        .map((sheet) => ({ ...sheet, actions: sheet.actions || [] }))

      await api.workbooks.create({
        spaceId: spaceId,
        environmentId: environmentId,
        name,
        // @ts-ignore
        sheets,
        ...(settings ? { settings } : {}),
        ...(namespace ? { namespace } : {}),
      })

      await api.jobs.complete(jobId, { info: 'Configured' })
    })
  }
}
