import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { automap } from '@flatfile/plugin-automap'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { validateIsbn } from '@flatfile/plugin-validate-isbn'

export default async function (listener: FlatfileListener) {
  // listener.use(
  //   ExcelExtractor({
  //     skipEmptyLines: true,
  //   })
  // )
  listener.use(
    DelimiterExtractor('txt', { delimiter: ',', skipEmptyLines: true })
  )

  listener.use(
    automap({
      accuracy: 'confident',
      defaultTargetSheet: 'contacts',
      matchFilename: /test/,
      debug: true,
      onFailure: (event: FlatfileEvent) => {
        // send an SMS, an email, post to an endpoint, etc.
        console.error(
          `Please visit https://spaces.flatfile.com/space/${event.context.spaceId}/files?mode=import to manually import file.`
        )
      },
    })
  )
}
