import type { FlatfileListener } from '@flatfile/listener'

import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'

export default async function (listener: FlatfileListener) {
  listener.use(exportWorkbookPlugin({ autoDownload: true, debug: true }))
}
