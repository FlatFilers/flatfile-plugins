import type { FlatfileEvent } from '@flatfile/listener'
import {
  bulkRecordHook,
  type FlatfileRecord,
} from '@flatfile/plugin-record-hook'
import fetch from 'cross-fetch'
import { asyncMap } from 'modern-async'

interface What3WordsConfig {
  what3wordsField: string
  countryField: string
  nearestPlaceField: string
  latField: string
  longField: string
  sheetSlug?: string
}

export function convertWhat3words(config: What3WordsConfig) {
  return bulkRecordHook(
    config.sheetSlug || '**',
    async (records: FlatfileRecord[], event: FlatfileEvent) => {
      const apiKey = await event.secrets('W3W_API_KEY')

      return await asyncMap(records, async (record) => {
        const words = record.get(config.what3wordsField)
        if (typeof words === 'string' && words.length > 0) {
          try {
            const response = await fetch(
              `https://api.what3words.com/v3/convert-to-coordinates?words=${words}`,
              {
                headers: {
                  'X-Api-Key': apiKey,
                },
              }
            )
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            record.set(config.countryField, result.country)
            record.set(config.nearestPlaceField, result.nearestPlace)
            record.set(config.latField, result.coordinates.lat)
            record.set(config.longField, result.coordinates.lng)
          } catch (error) {
            console.log({ error })
            record.addError(
              config.what3wordsField,
              'Invalid What3Words address'
            )
          }
        }
        return record
      })
    }
  )
}

export default convertWhat3words
