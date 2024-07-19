import type { FlatfileListener } from '@flatfile/listener'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { webhookEgress } from '@flatfile/plugin-webhook-egress'
import { contactsSheet } from '../../playground/src/blueprints'

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook(
      'contacts',
      (records, _event) => {
        console.log('records', records.length)
      },
      { debug: true }
    )
  )

  listener.use(
    webhookEgress(
      'workbook:submitActionFg',
      'http://localhost:5678/reject-non-flatfile-emails'
    )
  )

  listener.namespace(
    ['space:getting-started'],
    configureSpace(
      {
        workbooks: [
          {
            name: 'Playground',
            sheets: [contactsSheet],
            actions: [
              {
                operation: 'submitActionFg',
                mode: 'foreground',
                label: 'Submit data',
                type: 'string',
                description: 'Submit this data to a webhook.',
                primary: true,
              },
            ],
          },
        ],
      },
      async (event, workbookIds, tick) => {
        const { spaceId } = event.context
        console.log('Space configured', { spaceId, workbookIds })
      }
    )
  )
}
