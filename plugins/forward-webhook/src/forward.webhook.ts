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
      // console.dir(e, { depth: null })
      const { data } = await axios.post(url, { ...e })
      let callbackData = undefined
      if (callback) callbackData = await callback(data)
      // ('forward-webhook', callbackData || data)
      console.log('forward-webhook')
      // console.dir(callbackData || data, { depth: null })
      api.events.create({
        domain: e.domain as Flatfile.Domain,
        topic: 'job:outcome-acknowledged',
        context: {
          ...e.context,
          actionName: 'forward-webhook',
        },
        payload: callbackData || data,
      })
    })
  }
}
