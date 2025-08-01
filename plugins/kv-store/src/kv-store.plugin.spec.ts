import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { kv } from './kv-store.plugin'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('kv-store plugin', () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.FLATFILE_KV_URL = 'https://test-kv-url.com'
    process.env.FLATFILE_API_KEY = 'test-api-key'
    
    // Clear all mocks
    mockFetch.mockClear()
  })

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FLATFILE_KV_URL
    delete process.env.FLATFILE_API_KEY
  })

  describe('environment validation', () => {
    it('should throw error when FLATFILE_KV_URL is not set', async () => {
      delete process.env.FLATFILE_KV_URL
      
      await expect(kv.set('test-key', 'test-value')).rejects.toThrow('FLATFILE_KV_URL is not set')
    })

    it('should throw error when FLATFILE_API_KEY is not set', async () => {
      delete process.env.FLATFILE_API_KEY
      
      await expect(kv.set('test-key', 'test-value')).rejects.toThrow('FLATFILE_API_KEY is not set')
    })
  })

  describe('set method', () => {
    it('should successfully set a value', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await expect(kv.set('test-key', { name: 'John' })).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify({ name: 'John' }) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should handle fetch error during set', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.set('test-key', 'test-value')).rejects.toThrow(
        "KV Store: Failed to set value 'test-value' to key 'test-key'. Error: Error: Network error"
      )
    })

    it('should handle non-ok response during set', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: vi.fn().mockResolvedValue('Server error')
      })

      await expect(kv.set('test-key', 'test-value')).rejects.toThrow(
        "KV Store: Failed to set value 'test-value' to key 'test-key'. Error: Error: Server error"
      )
    })
  })

  describe('get method', () => {
    it('should successfully get a value', async () => {
      const mockData = { name: 'John', age: 30 }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(mockData) }))
      })

      const result = await kv.get('test-key')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-kv-url.com/key/test-key',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should return null when key does not exist (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await kv.get('non-existent-key')

      expect(result).toBeNull()
    })

    it('should return null when data is null or undefined', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: null }))
      })

      const result = await kv.get('test-key')

      expect(result).toBeNull()
    })

    it('should handle fetch error during get', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.get('test-key')).rejects.toThrow(
        "KV Store: Failed to get value for key 'test-key'. Error: Error: Network error"
      )
    })

    it('should handle non-404 error response during get', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal server error')
      })

      await expect(kv.get('test-key')).rejects.toThrow(
        "KV Store: Failed to get value for key 'test-key'. Error: Error: Internal server error"
      )
    })

    it('should handle invalid JSON in response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: 'invalid-json{' }))
      })

      await expect(kv.get('test-key')).rejects.toThrow(
        "KV Store: Failed to parse value 'invalid-json{' for key 'test-key'"
      )
    })
  })

  describe('clear method', () => {
    it('should successfully clear a value', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await expect(kv.clear('test-key')).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(null) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should handle error during clear', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.clear('test-key')).rejects.toThrow(
        "KV Store: Failed to clear key 'test-key'. Error: Error: KV Store: Failed to set value 'null' to key 'test-key'. Error: Error: Network error"
      )
    })
  })

  describe('list.append method', () => {
    it('should append to non-existing key', async () => {
      // First call for get (returns null)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.list.append('test-key', ['item1', 'item2'])

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['item1', 'item2']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should append to existing array', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['existing']) }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.list.append('test-key', ['new1', 'new2'])

      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['existing', 'new1', 'new2']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should append to existing array with unique constraint', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['existing', 'duplicate']) }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.list.append('test-key', ['duplicate', 'new'], { unique: true })

      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['existing', 'duplicate', 'new']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should not append when all values are duplicates with unique constraint', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['existing', 'duplicate']) }))
      })

      await kv.list.append('test-key', ['existing', 'duplicate'], { unique: true })

      expect(mockFetch).toHaveBeenCalledTimes(1) // Only get call, no set call
    })

    it('should convert non-array value to array', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify('single-value') }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.list.append('test-key', ['new1', 'new2'])

      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['single-value', 'new1', 'new2']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should handle error during append', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.list.append('test-key', ['item'])).rejects.toThrow(
        "KV Store: Failed to set values 'item' to key 'test-key'. Error: Error: KV Store: Failed to get value for key 'test-key'. Error: Error: Network error"
      )
    })
  })

  describe('list.delete method', () => {
    it('should delete values from array', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['item1', 'item2', 'item3']) }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.list.delete('test-key', ['item2'])

      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['item1', 'item3']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should handle non-existing key during delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(kv.list.delete('test-key', ['item'])).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only get call
    })

    it('should throw error when trying to delete from non-array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify('not-an-array') }))
      })

      await expect(kv.list.delete('test-key', ['item'])).rejects.toThrow(
        "KV Store: Failed to delete values 'item' from key 'test-key'. Error: Error: Value is not an array"
      )
    })

    it('should handle error during delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.list.delete('test-key', ['item'])).rejects.toThrow(
        "KV Store: Failed to delete values 'item' from key 'test-key'. Error: Error: KV Store: Failed to get value for key 'test-key'. Error: Error: Network error"
      )
    })
  })

  describe('list.pop method', () => {
    it('should pop last item from array', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['item1', 'item2', 'item3']) }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      const result = await kv.list.pop('test-key')

      expect(result).toBe('item3')
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['item1', 'item2']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should return null when key does not exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await kv.list.pop('test-key')

      expect(result).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only get call
    })

    it('should throw error when trying to pop from non-array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify('not-an-array') }))
      })

      await expect(kv.list.pop('test-key')).rejects.toThrow(
        "KV Store: Failed to pop from key 'test-key'. Error: Error: Value is not an array"
      )
    })

    it('should handle error during pop', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.list.pop('test-key')).rejects.toThrow(
        "KV Store: Failed to pop from key 'test-key'. Error: Error: KV Store: Failed to get value for key 'test-key'. Error: Error: Network error"
      )
    })
  })

  describe('list.shift method', () => {
    it('should shift first item from array', async () => {
      // First call for get
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify(['item1', 'item2', 'item3']) }))
      })
      
      // Second call for set
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      const result = await kv.list.shift('test-key')

      expect(result).toBe('item1')
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test-kv-url.com/key/test-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(['item2', 'item3']) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })

    it('should return null when key does not exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await kv.list.shift('test-key')

      expect(result).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only get call
    })

    it('should throw error when trying to shift from non-array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify('not-an-array') }))
      })

      await expect(kv.list.shift('test-key')).rejects.toThrow(
        "KV Store: Failed to shift from key 'test-key'. Error: Error: Value is not an array"
      )
    })

    it('should handle error during shift', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(kv.list.shift('test-key')).rejects.toThrow(
        "KV Store: Failed to shift from key 'test-key'. Error: Error: KV Store: Failed to get value for key 'test-key'. Error: Error: Network error"
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty array operations', async () => {
      // Test pop on empty array
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: JSON.stringify([]) }))
      })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      const result = await kv.list.pop('test-key')

      expect(result).toBeUndefined()
    })

    it('should handle complex object values', async () => {
      const complexObject = {
        nested: { data: [1, 2, 3] },
        array: ['a', 'b', 'c'],
        nullValue: null,
        boolValue: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('success')
      })

      await kv.set('complex-key', complexObject)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-kv-url.com/key/complex-key',
        {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(complexObject) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'test-api-key'
          }
        }
      )
    })
  })
})
