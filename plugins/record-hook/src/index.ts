import { Client, FlatfileEvent } from '@flatfile/listener'
import { RecordHook } from '@flatfile/configure'
import type { FlatfileRecord } from '@flatfile/hooks'

export const recordHook = (
  sheetSlug: string,
  callback: (record: FlatfileRecord) => {}
) => {
  return (client: Client) => {
    client.on(
      'records:*',
      {
        context: {
          // @ts-ignore
          sheetSlug,
        },
      },
      (event: FlatfileEvent) => {
        RecordHook(event, callback)
      }
    )
  }
}
