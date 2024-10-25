import { describe, expect, it } from 'vitest'
import {
  calculateDistance,
  calculateStatistics,
  convertToTabularFormat,
  filterByDateRange,
  removeDuplicatePoints,
} from './enrich.gpx.plugin'

describe('GPX Parser Utility Functions', () => {
  describe('calculateDistance', () => {
    it('should calculate the correct distance between two points', () => {
      const point1 = { latitude: 0, longitude: 0 }
      const point2 = { latitude: 1, longitude: 1 }
      const distance = calculateDistance(point1, point2)
      expect(distance).toBeCloseTo(157.2, 1)
    })
  })

  describe('removeDuplicatePoints', () => {
    it('should remove duplicate points', () => {
      const points = [
        {
          latitude: 0,
          longitude: 0,
          elevation: 100,
          time: '2023-01-01T00:00:00Z',
        },
        {
          latitude: 0,
          longitude: 0,
          elevation: 100,
          time: '2023-01-01T00:00:00Z',
        },
        {
          latitude: 1,
          longitude: 1,
          elevation: 200,
          time: '2023-01-01T00:01:00Z',
        },
      ]
      const result = removeDuplicatePoints(points)
      expect(result.length).toBe(2)
    })
  })

  describe('filterByDateRange', () => {
    it('should filter points within the given date range', () => {
      const points = [
        { latitude: 0, longitude: 0, time: '2023-01-01T00:00:00Z' },
        { latitude: 1, longitude: 1, time: '2023-01-02T00:00:00Z' },
        { latitude: 2, longitude: 2, time: '2023-01-03T00:00:00Z' },
      ]
      const startDate = new Date('2023-01-01T12:00:00Z')
      const endDate = new Date('2023-01-02T12:00:00Z')
      const result = filterByDateRange(points, startDate, endDate)
      expect(result.length).toBe(1)
      expect(result[0].latitude).toBe(1)
    })
  })

  describe('calculateStatistics', () => {
    it('should calculate total distance and elevation gain', () => {
      const points = [
        { latitude: 0, longitude: 0, elevation: 100 },
        { latitude: 1, longitude: 1, elevation: 200 },
        { latitude: 2, longitude: 2, elevation: 150 },
      ]
      const { totalDistance, elevationGain } = calculateStatistics(points)
      expect(totalDistance).toBeCloseTo(314.47, 1)
      expect(elevationGain).toBe(100)
    })
  })

  describe('convertToTabularFormat', () => {
    it('should convert waypoints, tracks, and routes to tabular format', () => {
      const waypoints = [
        { latitude: 0, longitude: 0, time: '2023-01-01T00:00:00Z' },
      ]
      const tracks = [
        {
          segments: [
            {
              points: [
                { latitude: 1, longitude: 1, time: '2023-01-01T00:01:00Z' },
              ],
            },
          ],
        },
      ]
      const routes = [
        {
          points: [{ latitude: 2, longitude: 2, time: '2023-01-01T00:02:00Z' }],
        },
      ]
      const result = convertToTabularFormat(waypoints, tracks, routes)
      expect(result.length).toBe(3)
      expect(result[0].latitude).toBe(0)
      expect(result[1].latitude).toBe(1)
      expect(result[2].latitude).toBe(2)
    })
  })
})
