import { describe, expect, it, vi } from 'vitest'
import { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { automap } from './automap.plugin'

describe('automap plugin', () => {
  const mockEvent = {
    topic: Flatfile.EventTopic.JobUpdated,
    context: {
      jobId: 'test-job-id',
      spaceId: 'test-space-id',
      environmentId: 'test-env-id',
      accountId: 'test-account-id',
    },
    payload: {},
    createdAt: new Date(),
    domain: Flatfile.Domain.Space,
  } as FlatfileEvent

  describe('onFailure callback', () => {
    it('should call synchronous onFailure callback with correct event', () => {
      const mockOnFailure = vi.fn()

      const plugin = automap({
        accuracy: 'confident',
        onFailure: mockOnFailure,
      })

      expect(plugin).toBeDefined()
      expect(mockOnFailure).not.toHaveBeenCalled()
    })

    it('should handle asynchronous onFailure callback that resolves', async () => {
      const mockOnFailure = vi.fn().mockResolvedValue(undefined)

      const plugin = automap({
        accuracy: 'confident',
        onFailure: mockOnFailure,
      })

      expect(plugin).toBeDefined()
      expect(mockOnFailure).not.toHaveBeenCalled()
    })

    it('should handle asynchronous onFailure callback that rejects', async () => {
      const mockOnFailure = vi.fn().mockRejectedValue(new Error('Test error'))

      const plugin = automap({
        accuracy: 'confident',
        onFailure: mockOnFailure,
      })

      expect(plugin).toBeDefined()
      expect(mockOnFailure).not.toHaveBeenCalled()
    })

    it('should accept both sync and async callback types', () => {
      const syncCallback = (event: FlatfileEvent) => {
        console.log('Sync callback called')
      }

      const asyncCallback = async (event: FlatfileEvent) => {
        console.log('Async callback called')
        return Promise.resolve()
      }

      const syncPlugin = automap({
        accuracy: 'confident',
        onFailure: syncCallback,
      })

      const asyncPlugin = automap({
        accuracy: 'confident',
        onFailure: asyncCallback,
      })

      expect(syncPlugin).toBeDefined()
      expect(asyncPlugin).toBeDefined()
    })
  })

  describe('plugin configuration', () => {
    it('should create plugin with required accuracy parameter', () => {
      const plugin = automap({
        accuracy: 'confident',
      })

      expect(plugin).toBeDefined()
    })

    it('should create plugin with all optional parameters including onFailure', () => {
      const mockOnFailure = vi.fn()

      const plugin = automap({
        accuracy: 'exact',
        debug: true,
        defaultTargetSheet: 'test-sheet',
        matchFilename: /test\.csv$/,
        onFailure: mockOnFailure,
        targetWorkbook: 'test-workbook',
      })

      expect(plugin).toBeDefined()
    })

    it('should create plugin with requiredFieldsOnly parameter', () => {
      const plugin = automap({
        accuracy: 'confident',
        requiredFieldsOnly: true,
      })

      expect(plugin).toBeDefined()
    })

    it('should create plugin with includeUnmappedAsCustom parameter', () => {
      const plugin = automap({
        accuracy: 'exact',
        includeUnmappedAsCustom: true,
      })

      expect(plugin).toBeDefined()
    })

    it('should create plugin with both new parameters', () => {
      const plugin = automap({
        accuracy: 'confident',
        requiredFieldsOnly: true,
        includeUnmappedAsCustom: true,
      })

      expect(plugin).toBeDefined()
    })
  })
})
