import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { dataChecklist } from './utils/data.checklist'

export function dataChecklistPlugin() {
  return function (listener: FlatfileListener) {
    listener.on(
      ['workbook:created', 'workbook:updated'],
      async (event: FlatfileEvent) => {
        const { spaceId } = event.context
        console.log(
          `\`dataChecklist\` firing on \`${event.topic}\` for space \`${spaceId}\``
        )
        await dataChecklist(spaceId as Flatfile.SpaceId)
      }
    )
  }
}
