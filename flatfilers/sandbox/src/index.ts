import type { FlatfileListener } from '@flatfile/listener'
import { HTMLTableExtractor } from '@flatfile/plugin-extract-html-table'

export default async function (listener: FlatfileListener) {
  listener.use(HTMLTableExtractor())
}
