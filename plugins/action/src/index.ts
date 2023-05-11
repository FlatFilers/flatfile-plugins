import { Client, FlatfileEvent } from '@flatfile/listener'
import { FlatfileClient } from '@flatfile/api'

export const action = (
  origin: string,
  name: string,
  operation: (event: FlatfileEvent, api: FlatfileClient) => void
) => {
  const api = new FlatfileClient()
  return (client: Client) => {
    client.on('action:triggered', (event: FlatfileEvent) => {
      const { actionName } = event.context
      if (actionName === `${origin}:${name}`) {
        operation(event, api)
      }
    })
  }
}
