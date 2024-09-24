import {
  FlatfileListener,
  FlatfileEvent,
  FlatfileRecord,
} from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const parseXml = promisify(parseString)

interface Waypoint {
  latitude: number
  longitude: number
  elevation?: number
  time?: string
  name?: string
  description?: string
}

interface Track {
  name?: string
  segments: { points: Waypoint[] }[]
}

interface Route {
  name?: string
  points: Waypoint[]
}

function calculateDistance(point1: Waypoint, point2: Waypoint): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function removeDuplicatePoints(points: Waypoint[]): Waypoint[] {
  return points.filter(
    (point, index, self) =>
      index ===
      self.findIndex(
        (p) =>
          p.latitude === point.latitude &&
          p.longitude === point.longitude &&
          p.elevation === point.elevation &&
          p.time === point.time
      )
  )
}

function filterByDateRange(
  points: Waypoint[],
  startDate: Date,
  endDate: Date
): Waypoint[] {
  return points.filter((point) => {
    const pointDate = new Date(point.time || '')
    return pointDate >= startDate && pointDate <= endDate
  })
}

function calculateStatistics(tabularData: Waypoint[]): {
  totalDistance: number
  elevationGain: number
} {
  let totalDistance = 0
  let elevationGain = 0

  for (let i = 1; i < tabularData.length; i++) {
    const prevPoint = tabularData[i - 1]
    const currentPoint = tabularData[i]

    totalDistance += calculateDistance(prevPoint, currentPoint)

    if (currentPoint.elevation && prevPoint.elevation) {
      const elevationDiff = currentPoint.elevation - prevPoint.elevation
      if (elevationDiff > 0) {
        elevationGain += elevationDiff
      }
    }
  }

  return { totalDistance, elevationGain }
}

function convertToTabularFormat(
  waypoints: Waypoint[],
  tracks: Track[],
  routes: Route[]
): Waypoint[] {
  const tabularData: Waypoint[] = [...waypoints]

  tracks.forEach((track) => {
    track.segments.forEach((segment) => {
      tabularData.push(...segment.points)
    })
  })

  routes.forEach((route) => {
    tabularData.push(...route.points)
  })

  return tabularData.sort(
    (a, b) =>
      new Date(a.time || '').getTime() - new Date(b.time || '').getTime()
  )
}

export default function gpxParser(listener: FlatfileListener) {
  listener.use(
    recordHook(
      'gpx_data',
      async (record: FlatfileRecord, event: FlatfileEvent) => {
        const gpxContent = record.get('gpx_file') as string

        if (!gpxContent) {
          record.addError('gpx_file', 'GPX file content is required')
          return record
        }

        try {
          const parsedGpx = await parseXml(gpxContent)

          const metadata = parsedGpx.gpx.metadata?.[0]
          const waypoints: Waypoint[] =
            parsedGpx.gpx.wpt?.map((wpt: any) => ({
              latitude: parseFloat(wpt.$.lat),
              longitude: parseFloat(wpt.$.lon),
              elevation: wpt.ele ? parseFloat(wpt.ele[0]) : undefined,
              time: wpt.time ? wpt.time[0] : undefined,
              name: wpt.name ? wpt.name[0] : undefined,
              description: wpt.desc ? wpt.desc[0] : undefined,
            })) || []
          const tracks: Track[] =
            parsedGpx.gpx.trk?.map((trk: any) => ({
              name: trk.name ? trk.name[0] : undefined,
              segments: trk.trkseg.map((seg: any) => ({
                points: seg.trkpt.map((pt: any) => ({
                  latitude: parseFloat(pt.$.lat),
                  longitude: parseFloat(pt.$.lon),
                  elevation: pt.ele ? parseFloat(pt.ele[0]) : undefined,
                  time: pt.time ? pt.time[0] : undefined,
                })),
              })),
            })) || []
          const routes: Route[] =
            parsedGpx.gpx.rte?.map((rte: any) => ({
              name: rte.name ? rte.name[0] : undefined,
              points: rte.rtept.map((pt: any) => ({
                latitude: parseFloat(pt.$.lat),
                longitude: parseFloat(pt.$.lon),
                elevation: pt.ele ? parseFloat(pt.ele[0]) : undefined,
                time: pt.time ? pt.time[0] : undefined,
              })),
            })) || []

          let tabularData = convertToTabularFormat(waypoints, tracks, routes)

          const removeDuplicates = record.get('remove_duplicates') === 'true'
          const filterDates = record.get('filter_dates') === 'true'
          const startDate = new Date((record.get('start_date') as string) || '')
          const endDate = new Date((record.get('end_date') as string) || '')

          if (removeDuplicates) {
            tabularData = removeDuplicatePoints(tabularData)
          }

          if (
            filterDates &&
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime())
          ) {
            tabularData = filterByDateRange(tabularData, startDate, endDate)
          }

          const { totalDistance, elevationGain } =
            calculateStatistics(tabularData)

          record.set('name', metadata?.name?.[0] || '')
          record.set('description', metadata?.desc?.[0] || '')
          record.set('waypoint_count', waypoints.length)
          record.set('track_count', tracks.length)
          record.set('route_count', routes.length)
          record.set('total_distance', totalDistance.toFixed(2))
          record.set('elevation_gain', elevationGain.toFixed(2))
          record.set('point_count', tabularData.length)
          record.set('tabular_data', JSON.stringify(tabularData))
        } catch (error) {
          record.addError('gpx_file', 'Failed to parse GPX content')
        }

        return record
      }
    )
  )
}
