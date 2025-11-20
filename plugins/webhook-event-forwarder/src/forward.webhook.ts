import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import fetch from 'cross-fetch'

export function webhookEventForward(
  url: string,
  callback?: (
    data: unknown,
    event: FlatfileEvent
  ) => Promise<unknown> | unknown,
  options?: {
    debug?: boolean
    timeout?: number
  }
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (event) => {
      const controller = new AbortController()
      const timeoutMs = options?.timeout ?? 5000 // Default 5 seconds
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `Error forwarding webhook: ${response.status} ${response.statusText}`
          )
        }

        const contentType = response.headers.get('content-type')
        const isJson = contentType?.includes('application/json')
        const data = isJson ? await response.json() : await response.text()

        callback ? await callback(data, event) : null
      } catch (err) {
        const errorMessage =
          err.name === 'AbortError'
            ? `Webhook request timed out after ${timeoutMs}ms`
            : err.toString()

        if (options?.debug) {
          console.error(`[webhook-event-forwarder] ${errorMessage}`)
        }

        callback
          ? await callback(
              {
                error: true,
                message: 'Error received, please try again',
                data: errorMessage,
              },
              event
            )
          : null
      } finally {
        clearTimeout(timeoutId)
      }
    })
  }
}
