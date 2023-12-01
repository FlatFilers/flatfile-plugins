import type { FlatfileListener } from '@flatfile/listener'

export default async function (listener: FlatfileListener) {
  listener.on('**', (event) => {
    console.log(event.topic)
  })
}
