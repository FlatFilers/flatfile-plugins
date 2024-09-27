import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { logInfo, logError } from '@flatfile/util-common'
import api from '@flatfile/api'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

interface StravaGPXFetcherConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface CacheItem {
  value: any
  timestamp: number
}

class Cache {
  private cache: Map<string, CacheItem> = new Map()
  private ttl: number

  constructor(ttl: number = 3600000) {
    // TTL in milliseconds, default 1 hour
    this.ttl = ttl
  }

  get(key: string): any {
    const item = this.cache.get(key)
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.value
    }
    this.cache.delete(key)
    return null
  }

  set(key: string, value: any): void {
    this.cache.set(key, { value, timestamp: Date.now() })
  }
}

async function authenticateStrava(
  config: StravaGPXFetcherConfig
): Promise<string> {
  const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code: '<authorization_code>', // This should be obtained through OAuth flow
  })
  return tokenResponse.data.access_token
}

async function fetchGPXData(
  accessToken: string,
  activityId: string
): Promise<string> {
  const response = await axios.get(
    `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,altitude,time&key_by_type=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  return response.data
}

function parseGPX(gpxData: string): any {
  const parser = new XMLParser()
  return parser.parse(gpxData)
}

function convertToTabularFormat(parsedGPX: any): any[] {
  // This is a simplified conversion. Adjust based on your specific GPX structure and requirements.
  const trackPoints = parsedGPX.gpx.trk.trkseg.trkpt
  return trackPoints.map((point: any) => ({
    latitude: point['@_lat'],
    longitude: point['@_lon'],
    elevation: point.ele,
    time: point.time,
  }))
}

export function stravaGPXFetcher(config: StravaGPXFetcherConfig) {
  const cache = new Cache()

  return (listener: FlatfileListener) => {
    listener.use((handler) => {
      handler.on('job:ready', async (event: FlatfileEvent) => {
        try {
          logInfo('strava-gpx-fetcher', 'Job ready event received')

          handler.on('strava:fetch-gpx', async (event: FlatfileEvent) => {
            const { activityId } = event.payload

            let gpxData = cache.get(activityId)
            if (!gpxData) {
              const accessToken = await authenticateStrava(config)
              gpxData = await fetchGPXData(accessToken, activityId)
              cache.set(activityId, gpxData)
            }

            const parsedGPX = parseGPX(gpxData)
            const tabularData = convertToTabularFormat(parsedGPX)

            // Assuming we're working with a specific sheet in the Flatfile space
            const sheetId = event.context.sheetId
            await api.records.insert(sheetId, tabularData)

            logInfo(
              'strava-gpx-fetcher',
              `GPX data fetched and inserted for activity ${activityId}`
            )
          })
        } catch (error) {
          logError(
            'strava-gpx-fetcher',
            `Error processing event: ${error.message}`
          )
        }
      })
    })
  }
}
