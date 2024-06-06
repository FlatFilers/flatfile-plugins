import type { FlatfileListener } from '@flatfile/listener'

import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(ExcelExtractor())
  listener.use(DelimiterExtractor('.txt', { delimiter: ',' }))
}
