import { beforeEach, describe, expect, it, vi } from 'vitest'
import { asyncMap } from './async.map'

describe('asyncMap', () => {
  const mockArray = ['a', 'b', 'c']
  const mockCallback = vi
    .fn()
    .mockImplementation((item) => Promise.resolve(item.toUpperCase()))

  beforeEach(() => {
    mockCallback.mockClear()
  })

  it('maps over an array and calls the callback function on each item', async () => {
    const result = await asyncMap(mockArray, mockCallback)
    expect(mockCallback).toHaveBeenCalledTimes(mockArray.length)
    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('returns an empty array when input array is empty', async () => {
    const result = await asyncMap([], mockCallback)
    expect(result).toEqual([])
  })

  it('can run callbacks in parallel', async () => {
    await asyncMap(mockArray, mockCallback, { parallel: true })
    expect(mockCallback).toHaveBeenCalledTimes(mockArray.length)
  })

  it('rejects when any callback function rejects', async () => {
    const mockError = new Error('Error')
    const mockCallbackWithError = vi.fn().mockRejectedValueOnce(mockError)
    await expect(
      asyncMap(mockArray, mockCallbackWithError)
    ).rejects.toBeTruthy()
  })

  it('times out when any callback function takes too long', async () => {
    const LONG_TIMEOUT = 100
    const mockSlowCallback = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, LONG_TIMEOUT + 10))
      )
    await expect(
      asyncMap(mockArray, mockSlowCallback, { timeout: LONG_TIMEOUT })
    ).rejects.toThrow('timed out')
  })
})
