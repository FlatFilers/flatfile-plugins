import type { FlatfileListener } from '@flatfile/listener'
import { convertWhat3words } from '@flatfile/plugin-convert-what3words'
import { configureSpace } from '@flatfile/plugin-space-configure'

export default async function (listener: FlatfileListener) {
  listener.use(
    convertWhat3words({
      sheetSlug: 'people',
      what3wordsField: 'what3words',
      countryField: 'country',
      nearestPlaceField: 'nearestPlace',
      latField: 'lat',
      longField: 'long',
    })
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'People',
              slug: 'people',
              fields: [
                {
                  key: 'name',
                  type: 'string',
                  label: 'Name',
                },
                {
                  key: 'nearestPlace',
                  type: 'string',
                  label: 'Nearest Place',
                },
                {
                  key: 'country',
                  type: 'string',
                  label: 'Country',
                },
                {
                  key: 'lat',
                  type: 'number',
                  label: 'Latitude',
                },
                {
                  key: 'long',
                  type: 'number',
                  label: 'Longitude',
                },
                {
                  key: 'what3words',
                  type: 'string',
                  label: 'What3Words',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
