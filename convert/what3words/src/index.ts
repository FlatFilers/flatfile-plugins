import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import {
  bulkRecordHook,
  type FlatfileRecord,
} from '@flatfile/plugin-record-hook'
import what3words, {
  ApiVersion,
  Transport,
  What3wordsService,
  fetchTransport,
} from '@what3words/api'

const api = new FlatfileClient()

interface What3WordsConfig {
  what3wordsField: string
  countryField: string
  nearestPlaceField: string
  latField: string
  longField: string
  sheetSlug?: string
}

async function getSecret(
  name: string,
  environmentId?: string,
  spaceId?: string
): Promise<string | undefined> {
  try {
    const secrets = await api.secrets.list({ spaceId, environmentId })
    const secret = secrets.data.find((secret) => secret.name === name)
    if (!secret) {
      return undefined
    }
    return secret.value
  } catch (e) {
    console.error(e, `Error fetching secret ${name}`)
    return undefined
  }
}

export function convertWhat3words(config: What3WordsConfig) {
  const w3wConfig: {
    host: string
    apiVersion: ApiVersion
  } = {
    host: 'https://api.what3words.com',
    apiVersion: ApiVersion.Version3,
  }
  return bulkRecordHook(
    config.sheetSlug || '**',
    async (records: FlatfileRecord[], event: FlatfileEvent) => {
      const { environmentId, spaceId } = event.context

      const apiKey = await event.secrets('W3W_API_KEY')
      const transport: Transport = fetchTransport()
      const w3wService: What3wordsService = what3words(apiKey, w3wConfig, {
        transport,
      })

      for (const record of records) {
        const words = record.get(config.what3wordsField) as string
        if (words) {
          try {
            const result = await w3wService.convertToCoordinates({ words })
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
      }
    }
  )
}

export default convertWhat3words
