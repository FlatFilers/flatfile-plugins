import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'

export function webhookEventForward(
  url: string,
  callback?: (data: any, event: FlatfileEvent) => Promise<any> | any,
  options?: {
    debug?: boolean
  }
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (event) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })

        if (!response.ok) throw new Error('Error forwarding webhook')

        const contentType = response.headers.get('content-type')
        const isJson = contentType && contentType.includes('application/json')
        const data = isJson ? await response.json() : await response.text()

        callback ? await callback(data, event) : null
      } catch (err) {
        if (options?.debug) {
          console.error(err.toString())
        }

        callback
          ? await callback(
              {
                error: true,
                message: 'Error received, please try again',
                data: err.toString(),
              },
              event
            )
          : null
      }
    })
  }
}
