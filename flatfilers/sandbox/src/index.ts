import type { FlatfileListener } from '@flatfile/listener'

import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(ExcelExtractor())
  listener.use(DelimiterExtractor(".txt", { delimiter: "," }))
  // listener.use(exportWorkbookPlugin({ autoDownload: true, debug: true }))
}

