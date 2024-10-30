import type { FlatfileListener } from '@flatfile/listener'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'

export default function (listener: FlatfileListener) {
  listener.use(
    ExcelExtractor({
      headerDetectionOptions: {
        algorithm: 'dataRowAndSubHeaderDetection',
        rowsToSearch: 20,
      },
    })
  )
}
