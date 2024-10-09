import type { FlatfileListener } from '@flatfile/listener'
import { MarkdownExtractor } from '@flatfile/plugin-markdown-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(MarkdownExtractor())
}
