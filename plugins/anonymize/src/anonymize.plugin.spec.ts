import { describe, it, expect, vi, beforeEach } from 'vitest'
import { anonymize } from './anonymize.plugin'
import type { FlatfileRecord } from '@flatfile/plugin-record-hook'

vi.mock('@flatfile/plugin-record-hook', () => ({
  bulkRecordHook: vi.fn((sheetSlug, callback, options) => {
    return {
      type: 'bulkRecordHook',
      sheetSlug,
      callback,
      options,
    }
  }),
}))

vi.mock('@flatfile/util-common', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}))

describe('anonymize plugin', () => {
  let mockRecord: FlatfileRecord
  let mockListener: any

  beforeEach(() => {
    mockRecord = {
      get: vi.fn(),
      set: vi.fn(),
      addError: vi.fn(),
    } as any

    mockListener = {
      use: vi.fn(),
    }

    vi.clearAllMocks()
  })

  it('should create a plugin with required options', () => {
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    expect(plugin).toBeInstanceOf(Function)

    plugin(mockListener)
    expect(mockListener.use).toHaveBeenCalled()
  })

  it('should anonymize valid email addresses', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    plugin(mockListener)

    const bulkRecordHookCall = vi.mocked(bulkRecordHook).mock.calls[0]
    const callback = bulkRecordHookCall[1]

    mockRecord.get = vi.fn().mockReturnValue('test@example.com')

    await callback([mockRecord], {} as any)

    expect(mockRecord.get).toHaveBeenCalledWith('email')
    expect(mockRecord.set).toHaveBeenCalled()

    const setCall = vi.mocked(mockRecord.set).mock.calls[0]
    expect(setCall[0]).toBe('email')
    expect(setCall[1]).toMatch(/^[a-f0-9]{32}@[a-f0-9]{8}\.com$/)
  })

  it('should preserve domain when preserveDomain option is true', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
      preserveDomain: true,
    })

    plugin(mockListener)

    const bulkRecordHookCall = vi.mocked(bulkRecordHook).mock.calls[0]
    const callback = bulkRecordHookCall[1]

    mockRecord.get = vi.fn().mockReturnValue('test@example.com')

    await callback([mockRecord], {} as any)

    const setCall = vi.mocked(mockRecord.set).mock.calls[0]
    expect(setCall[1]).toMatch(/^[a-f0-9]{32}@example\.com$/)
  })

  it('should use salt when provided', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin1 = anonymize({
      sheet: 'test-sheet',
      field: 'email',
      salt: 'salt1',
    })

    const plugin2 = anonymize({
      sheet: 'test-sheet',
      field: 'email',
      salt: 'salt2',
    })

    plugin1(mockListener)
    plugin2(mockListener)

    const callback1 = vi.mocked(bulkRecordHook).mock.calls[0][1]
    const callback2 = vi.mocked(bulkRecordHook).mock.calls[1][1]

    const mockRecord1 = {
      ...mockRecord,
      get: vi.fn().mockReturnValue('test@example.com'),
      set: vi.fn(),
      addError: vi.fn(),
    } as any
    const mockRecord2 = {
      ...mockRecord,
      get: vi.fn().mockReturnValue('test@example.com'),
      set: vi.fn(),
      addError: vi.fn(),
    } as any

    await callback1([mockRecord1], {} as any)
    await callback2([mockRecord2], {} as any)

    const result1 = vi.mocked(mockRecord1.set).mock.calls[0][1]
    const result2 = vi.mocked(mockRecord2.set).mock.calls[0][1]

    expect(result1).not.toBe(result2)
  })

  it('should skip invalid email addresses', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    plugin(mockListener)

    const callback = vi.mocked(bulkRecordHook).mock.calls[0][1]

    mockRecord.get = vi.fn().mockReturnValue('invalid-email')

    await callback([mockRecord], {} as any)

    expect(mockRecord.set).not.toHaveBeenCalled()
    expect(mockRecord.addError).not.toHaveBeenCalled()
  })

  it('should skip non-string values', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    plugin(mockListener)

    const callback = vi.mocked(bulkRecordHook).mock.calls[0][1]

    mockRecord.get = vi.fn().mockReturnValue(123)

    await callback([mockRecord], {} as any)

    expect(mockRecord.set).not.toHaveBeenCalled()
    expect(mockRecord.addError).not.toHaveBeenCalled()
  })

  it('should skip null/undefined values', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    plugin(mockListener)

    const callback = vi.mocked(bulkRecordHook).mock.calls[0][1]

    mockRecord.get = vi.fn().mockReturnValue(null)

    await callback([mockRecord], {} as any)

    expect(mockRecord.set).not.toHaveBeenCalled()
    expect(mockRecord.addError).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    const { bulkRecordHook } = await import('@flatfile/plugin-record-hook')
    const plugin = anonymize({
      sheet: 'test-sheet',
      field: 'email',
    })

    plugin(mockListener)

    const callback = vi.mocked(bulkRecordHook).mock.calls[0][1]

    mockRecord.get = vi.fn().mockReturnValue('test@example.com')
    mockRecord.set = vi.fn().mockImplementation(() => {
      throw new Error('Test error')
    })

    await callback([mockRecord], {} as any)

    expect(mockRecord.addError).toHaveBeenCalledWith(
      'email',
      'Failed to anonymize email: Test error'
    )
  })
})
