import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { promisify } from 'util'
import { parseString } from 'xml2js'

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

interface EnrichedGpxData {
  name: string
  description: string
  waypointCount: number
  trackCount: number
  routeCount: number
  totalDistance: string
  elevationGain: string
  pointCount: number
  tabularData: string
}

interface GpxParserConfig {
  sheetSlug: string
  gpxFileField: string
  removeDuplicatesField: string
  filterDatesField: string
  startDateField: string
  endDateField: string
}

// Export utility functions
export function calculateDistance(point1: Waypoint, point2: Waypoint): number {
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

export function removeDuplicatePoints(points: Waypoint[]): Waypoint[] {
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

export function filterByDateRange(
  points: Waypoint[],
  startDate: Date,
  endDate: Date
): Waypoint[] {
  return points.filter((point) => {
    const pointDate = new Date(point.time || '')
    return pointDate >= startDate && pointDate <= endDate
  })
}

export function calculateStatistics(tabularData: Waypoint[]): {
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

export function convertToTabularFormat(
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

async function enrichGpxData(
  gpxContent: string,
  removeDuplicates: boolean,
  filterDates: boolean,
  startDate: Date,
  endDate: Date
): Promise<EnrichedGpxData> {
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

  if (removeDuplicates) {
    tabularData = removeDuplicatePoints(tabularData)
  }

  if (filterDates && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    tabularData = filterByDateRange(tabularData, startDate, endDate)
  }

  const { totalDistance, elevationGain } = calculateStatistics(tabularData)

  return {
    name: metadata?.name?.[0] || '',
    description: metadata?.desc?.[0] || '',
    waypointCount: waypoints.length,
    trackCount: tracks.length,
    routeCount: routes.length,
    totalDistance: totalDistance.toFixed(2),
    elevationGain: elevationGain.toFixed(2),
    pointCount: tabularData.length,
    tabularData: JSON.stringify(tabularData),
  }
}

export default function enrichGpx(
  listener: FlatfileListener,
  config: GpxParserConfig
) {
  const {
    sheetSlug,
    gpxFileField,
    removeDuplicatesField,
    filterDatesField,
    startDateField,
    endDateField,
  } = config

  listener.use(
    recordHook(
      sheetSlug,
      async (record: FlatfileRecord, event: FlatfileEvent) => {
        const gpxContent = record.get(gpxFileField) as string

        if (!gpxContent) {
          record.addError(gpxFileField, 'GPX file content is required')
          return record
        }

        try {
          const removeDuplicates = record.get(removeDuplicatesField) === 'true'
          const filterDates = record.get(filterDatesField) === 'true'
          const startDate = new Date(
            (record.get(startDateField) as string) || ''
          )
          const endDate = new Date((record.get(endDateField) as string) || '')

          const enrichedData = await enrichGpxData(
            gpxContent,
            removeDuplicates,
            filterDates,
            startDate,
            endDate
          )

          record.set('name', enrichedData.name)
          record.set('description', enrichedData.description)
          record.set('waypoint_count', enrichedData.waypointCount)
          record.set('track_count', enrichedData.trackCount)
          record.set('route_count', enrichedData.routeCount)
          record.set('total_distance', enrichedData.totalDistance)
          record.set('elevation_gain', enrichedData.elevationGain)
          record.set('point_count', enrichedData.pointCount)
          record.set('tabular_data', enrichedData.tabularData)
        } catch (error) {
          record.addError(gpxFileField, 'Failed to parse GPX content')
        }

        return record
      }
    )
  )
}
