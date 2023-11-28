import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

export function forwardWebhook(
  url?: string,
  callback?: (data, event) => Promise<any> | any,
  options?: any
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (event) => {
      try {
        const post = await axios.post(
          url || process.env.WEBHOOK_SITE_URL,
          event
        )
        if (post.status !== 200) throw new Error('Error forwarding webhook')
        const data =
          post.headers['content-type'] === 'application/json'
            ? { ...JSON.parse(JSON.stringify(post.data)) }
            : { data: post.data }
        callback ? await callback(data, event) : null
      } catch (err) {
        console.error(err)
        callback
          ? await callback(
              {
                error: true,
                message: 'Error recieved, please try again',
                data: err,
              },
              event
            )
          : null
      }
    })
  }
}
