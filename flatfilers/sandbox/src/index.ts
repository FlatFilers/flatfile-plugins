import type { FlatfileRecord } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import {
  configureSpace,
  dataChecklist,
  dataChecklistPlugin,
} from '@flatfile/plugin-space-configure'
import { contacts } from './sheets/contacts'

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook(
      'contacts',
      async (records: FlatfileRecord[], event: FlatfileEvent) => {
        // TODO: Add your logic here
        return records
      },
      { debug: true }
    )
  )
  listener.use(dataChecklistPlugin())
  listener.use(
    configureSpace(
      {
        workbooks: [
          {
            name: 'Sandbox',
            sheets: [contacts],
            actions: [
              {
                operation: 'simpleSubmitAction',
                mode: 'foreground',
                label: 'Submit data',
                description: 'Action for handling data inside of onSubmit',
                primary: true,
              },
            ],
            settings: {
              trackChanges: true,
            },
          },
        ],
      }
      // async (event: FlatfileEvent) => {
      //   You can use the `dataChecklist` function to create a data checklist in this callback or you can use
      //   the `dataChecklistPlugin` to create a data checklist if you're not using the `configureSpace` plugin
      //   await dataChecklist(event.context.spaceId)
      // }
    )
  )
}
