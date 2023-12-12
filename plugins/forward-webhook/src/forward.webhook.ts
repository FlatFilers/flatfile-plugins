import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

export function forwardWebhook(
  url?: string,
  callback?: (data, event) => Promise<any> | any,
  options?: any
) {
  console.log('setting up forwarding with data')
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (event) => {
      try {
        const post = await axios.post(
          url || process.env.WEBHOOK_SITE_URL,
          event
        )
        if (post.status !== 200) throw new Error('Error forwarding webhook')
        const contentTypeExists = !!(
          post?.headers &&
          post?.headers['content-type'] !== undefined &&
          post?.headers['content-type'] !== null
        )
        const contentTypeIsJson = !!(
          contentTypeExists &&
          post?.headers['content-type'] === 'application/json'
        )
        const dataIsJson = !!JSON.parse(JSON.stringify(post.data))
        const checkContentType = contentTypeExists
          ? contentTypeIsJson
          : dataIsJson
        const data = checkContentType
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
