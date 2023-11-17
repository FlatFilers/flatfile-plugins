import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

// no return value
export function forwardWebhook(
  url: string,
  callback?: (data) => Promise<any> | any,
  options?: any
) {
  return async (listener: FlatfileListener) => {
    return listener.on('**', async (e) => {
      if (e.topic === 'job:outcome-acknowledged') return
      try {
        const { data } = await axios.post(url, { ...e })
        console.dir(data)
        let callbackData
        if (callback) callbackData = await callback(data)
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
