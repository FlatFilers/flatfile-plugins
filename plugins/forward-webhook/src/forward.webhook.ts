import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

export function forwardWebhook(
  url?: string,
  callback?: (data) => Promise<any> | any,
  options?: any
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (event) => {
      if (event.topic === 'job:outcome-acknowledged') return
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

        let callbackData = callback ? await callback(data) : null
        api.events.create({
          domain: event.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...event.context,
            actionName: 'forward-webhook',
          },
          payload: callbackData || data,
        })
      } catch (err) {
        console.error(err)
        api.events.create({
          domain: event.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...event.context,
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
