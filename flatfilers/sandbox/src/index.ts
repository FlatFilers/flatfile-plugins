import type { FlatfileListener } from '@flatfile/listener'
import { XMLExtractor } from '@flatfile/plugin-xml-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(XMLExtractor())
}
