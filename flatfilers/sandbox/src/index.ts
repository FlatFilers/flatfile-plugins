import type { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'
import { automap } from "@flatfile/plugin-automap";


export default async function (listener: FlatfileListener) {
  listener.use(ExcelExtractor())
  listener.use(DelimiterExtractor('txt', { delimiter: ',' }))

  listener.use(
    automap({
      accuracy: "confident",
      defaultTargetSheet: "contacts",
      matchFilename: /test/,
      debug: true,
      onFailure: (event: FlatfileEvent) => {
        // send an SMS, an email, post to an endpoint, etc.
        console.error(
          `Please visit https://spaces.flatfile.com/space/${event.context.spaceId}/files?mode=import to manually import file.`
        );
      },
    })
  );
}
