import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

// no return value
export function forwardWebhook(
  url?: string,
  callback?: (data) => Promise<any> | any,
  options?: any
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (e) => {
      if (e.topic === 'job:outcome-acknowledged') return
      console.log('starting try')
      try {
        const post = await axios.post(url || process.env.WEBHOOK_SITE_URL, e)
        const data =
          typeof post.data === 'string' && post.data.length > 0
            ? { ...JSON.parse(post.data) }
            : { ...post.data }

        console.dir(data)

        let callbackData = callback ? await callback(data) : null
        console.log('success')
        api.events.create({
          domain: e.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...e.context,
            actionName: 'forward-webhook',
          },
          payload: callbackData || data,
        })
      } catch (err) {
        console.log('error forwarding webhook')
        console.error(err)
        api.events.create({
          domain: e.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...e.context,
            actionName: 'forward-webhook',
          },
          payload: {
            error: true,
            message: 'Error recieved, please try again',
            data: err,
          },
        })
      }
    })
  }
}
