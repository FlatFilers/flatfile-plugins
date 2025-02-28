import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { dataChecklist } from './utils/data.checklist'
import { FlatfileClient } from '@flatfile/api'

const api = new FlatfileClient()

export function dataChecklistPlugin() {
  return function (listener: FlatfileListener) {
    listener.on(
      ['workbook:created', 'workbook:updated'],
      async (event: FlatfileEvent) => {
        const { spaceId, workbookId } = event.context

        const { data: workbook } = await api.workbooks.get(workbookId)
        if (
          workbook.labels.includes('file') &&
          workbook.name.startsWith('[file]')
        ) {
          console.log('Skipping file workbook')
          return
        }

        console.log(
          `\`dataChecklist\` firing on \`${event.topic}\` for space \`${spaceId}\``
        )
        await dataChecklist(spaceId as Flatfile.SpaceId)
      }
    )
  }
}
