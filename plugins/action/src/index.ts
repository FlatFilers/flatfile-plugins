import { Client, FlatfileEvent } from '@flatfile/listener'
import { FlatfileClient } from '@flatfile/api'

export const action = (
  operation: string,
  fn: (event: FlatfileEvent, api: FlatfileClient) => void
) => {
  const api = new FlatfileClient()
  return (client: Client) => {
    client.on('job:created', async (event: FlatfileEvent) => {
      const { jobId } = event.context
      if (event.payload.operation === operation) {
        await fn(event, api)
        await api.jobs.update(jobId, {
          status: 'complete',
        })
      }
    })
  }
}
