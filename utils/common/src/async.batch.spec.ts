import type { FlatfileEvent } from '@flatfile/listener'
import { describe, expect, it, vi } from 'vitest'
import { asyncBatch, chunkify } from './async.batch'

describe('asyncBatch', () => {
  it('should split the array into chunks and call the callback for each chunk', async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(4)
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2, 3], undefined)
    expect(callback).toHaveBeenNthCalledWith(2, [4, 5, 6], undefined)
    expect(callback).toHaveBeenNthCalledWith(3, [7, 8, 9], undefined)
    expect(callback).toHaveBeenNthCalledWith(4, [10], undefined)
    expect(results).toEqual([6, 15, 24, 10])
  })

  it('should handle empty array', async () => {
    const arr: number[] = []
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).not.toHaveBeenCalled()
    expect(results).toEqual([])
  })

  it('should handle array smaller than chunk size', async () => {
    const arr = [1, 2]
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([1, 2], undefined)
    expect(results).toEqual([3])
  })

  it('should handle array size equal to chunk size', async () => {
    const arr = [1, 2, 3]
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([1, 2, 3], undefined)
    expect(results).toEqual([6])
  })

  it('should handle parallel value greater than array size', async () => {
    const arr = [1, 2, 3, 4, 5]
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 2,
      parallel: 10,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2], undefined)
    expect(callback).toHaveBeenNthCalledWith(2, [3, 4], undefined)
    expect(callback).toHaveBeenNthCalledWith(3, [5], undefined)
    expect(results).toEqual([3, 7, 5])
  })

  it('should handle asynchronous callbacks', async () => {
    const arr = [1, 2, 3]
    const callback = vi.fn((chunk: number[], event?: FlatfileEvent) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(chunk.reduce((sum, num) => sum + num, 0))
        }, 1000)
      })
    })
    const options = {
      chunkSize: 2,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2], undefined)
    expect(callback).toHaveBeenNthCalledWith(2, [3], undefined)
    expect(results).toEqual([3, 3])
  })

  describe('chunkify()', () => {
    it('chunks an array of 10 items into parts of 2', () => {
      const arr = Array.from({ length: 10 }, (_, i) => i + 1)
      const chunked = chunkify(arr, 2)
      expect(chunked.length).toBe(5)
      expect(chunked[0]).toEqual([1, 2])
      expect(chunked[4]).toEqual([9, 10])
    })

    it('handles an array with length not perfectly divisible by chunk size', () => {
      const arr = [1, 2, 3, 4, 5]
      const chunked = chunkify(arr, 2)
      expect(chunked.length).toBe(3)
      expect(chunked[0]).toEqual([1, 2])
      expect(chunked[2]).toEqual([5])
    })

    it('returns the original array if chunk size is greater than array length', () => {
      const arr = [1, 2, 3]
      const chunked = chunkify(arr, 5)
      expect(chunked.length).toBe(1)
      expect(chunked[0]).toEqual([1, 2, 3])
    })

    it('returns an empty array when chunk size is 0', () => {
      const arr = [1, 2, 3]
      const chunked = chunkify(arr, 0)
      expect(chunked).toEqual([])
    })

    it('returns an empty array when the input array is empty', () => {
      const arr = []
      const chunked = chunkify(arr, 3)
      expect(chunked).toEqual([])
    })
  })
})
