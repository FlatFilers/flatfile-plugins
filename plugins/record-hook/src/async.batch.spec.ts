import { asyncBatch } from './async.batch'

describe('asyncBatch', () => {
  it('should split the array into chunks and call the callback for each chunk', async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const callback = jest.fn((chunk: number[]) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(4)
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2, 3])
    expect(callback).toHaveBeenNthCalledWith(2, [4, 5, 6])
    expect(callback).toHaveBeenNthCalledWith(3, [7, 8, 9])
    expect(callback).toHaveBeenNthCalledWith(4, [10])
    expect(results).toEqual([6, 15, 24, 10])
  })

  it('should handle empty array', async () => {
    const arr: number[] = []
    const callback = jest.fn((chunk: number[]) => {
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
    const callback = jest.fn((chunk: number[]) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([1, 2])
    expect(results).toEqual([3])
  })

  it('should handle array size equal to chunk size', async () => {
    const arr = [1, 2, 3]
    const callback = jest.fn((chunk: number[]) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 3,
      parallel: 2,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([1, 2, 3])
    expect(results).toEqual([6])
  })

  it('should handle parallel value greater than array size', async () => {
    const arr = [1, 2, 3, 4, 5]
    const callback = jest.fn((chunk: number[]) => {
      return Promise.resolve(chunk.reduce((sum, num) => sum + num, 0))
    })
    const options = {
      chunkSize: 2,
      parallel: 10,
    }

    const results = await asyncBatch(arr, callback, options)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2])
    expect(callback).toHaveBeenNthCalledWith(2, [3, 4])
    expect(callback).toHaveBeenNthCalledWith(3, [5])
    expect(results).toEqual([3, 7, 5])
  })

  it('should handle asynchronous callbacks', async () => {
    const arr = [1, 2, 3]
    const callback = jest.fn((chunk: number[]) => {
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
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2])
    expect(callback).toHaveBeenNthCalledWith(2, [3])
    expect(results).toEqual([3, 3])
  })
})
