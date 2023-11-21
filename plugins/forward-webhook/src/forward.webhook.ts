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
      try {
        const post = await axios.post(url || process.env.WEBHOOK_SITE_URL, e)
        if (post.status !== 200) throw new Error('Error forwarding webhook')
        const data =
          post.headers['content-type'] === 'application/json'
            ? { ...JSON.parse(JSON.stringify(post.data)) }
            : { data: post.data }

        let callbackData = callback ? await callback(data) : null
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
