import { describe, expect, it } from 'vitest'
import { deepEqual } from './record.utils'

describe('deepEqual', () => {
  it('returns true for identical primitive values', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('test', 'test')).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
    expect(deepEqual(undefined, undefined)).toBe(true)
  })

  it('returns false for different primitive values', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('test', 'test2')).toBe(false)
    expect(deepEqual(true, false)).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
  })

  it('returns true for empty objects', () => {
    expect(deepEqual({}, {})).toBe(true)
  })

  it('returns true for objects with same properties in different order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  it('returns false for objects with different properties', () => {
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
  })

  it('handles nested objects correctly', () => {
    const obj1 = { a: { b: 1, c: 2 }, d: 3 }
    const obj2 = { a: { b: 1, c: 2 }, d: 3 }
    const obj3 = { a: { b: 1, c: 3 }, d: 3 }

    expect(deepEqual(obj1, obj2)).toBe(true)
    expect(deepEqual(obj1, obj3)).toBe(false)
  })

  it('handles arrays correctly', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false)
  })

  it('handles objects with array values', () => {
    const obj1 = { arr: [1, 2, 3], val: 'test' }
    const obj2 = { arr: [1, 2, 3], val: 'test' }
    const obj3 = { arr: [1, 2, 4], val: 'test' }

    expect(deepEqual(obj1, obj2)).toBe(true)
    expect(deepEqual(obj1, obj3)).toBe(false)
  })

  it('handles complex nested structures', () => {
    const complex1 = {
      a: {
        b: [1, 2, { c: 3 }],
        d: { e: 'test' },
      },
      f: null,
    }
    const complex2 = {
      a: {
        b: [1, 2, { c: 3 }],
        d: { e: 'test' },
      },
      f: null,
    }
    const complex3 = {
      a: {
        b: [1, 2, { c: 4 }],
        d: { e: 'test' },
      },
      f: null,
    }

    expect(deepEqual(complex1, complex2)).toBe(true)
    expect(deepEqual(complex1, complex3)).toBe(false)
  })
  it('removes unchanged values when removeUnchanged is true', () => {
    const obj1 = {
      values: {
        field1: { value: 'test1' },
        field2: { value: 'test2' },
        field3: { value: 'test3' },
      },
    }
    const obj2 = {
      values: {
        field1: { value: 'test1' },
        field2: { value: 'changed' },
        field3: { value: 'test3' },
      },
    }

    // Create clones to verify original objects are modified
    const clone1 = JSON.parse(JSON.stringify(obj1))
    const clone2 = JSON.parse(JSON.stringify(obj2))

    expect(deepEqual(clone1, clone2, { removeUnchanged: true })).toBe(false)

    // Verify unchanged fields were removed
    expect(clone1.values.field1).toBeUndefined()
    expect(clone1.values.field3).toBeUndefined()
    expect(clone2.values.field1).toBeUndefined()
    expect(clone2.values.field3).toBeUndefined()

    // Verify changed field remains
    expect(clone1.values.field2).toBeDefined()
    expect(clone2.values.field2).toBeDefined()
  })

  it('removes values object if all fields are unchanged', () => {
    const obj1 = {
      values: {
        field1: { value: 'test1' },
        field2: { value: 'test2' },
      },
      otherProp: 'stays',
    }
    const obj2 = {
      values: {
        field1: { value: 'test1' },
        field2: { value: 'test2' },
      },
      otherProp: 'stays',
    }

    const clone1 = JSON.parse(JSON.stringify(obj1))
    const clone2 = JSON.parse(JSON.stringify(obj2))

    expect(deepEqual(clone1, clone2, { removeUnchanged: true })).toBe(true)

    // Verify values object was removed since all fields matched
    expect(clone1.values).toBeUndefined()
    expect(clone2.values).toBeUndefined()

    // Other properties remain
    expect(clone1.otherProp).toBe('stays')
    expect(clone2.otherProp).toBe('stays')
  })
  it('handles arrays with different orders', () => {
    // Test if array order matters (currently it does)
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false)
  })
  it('handles special values correctly', () => {
    expect(deepEqual(NaN, NaN)).toBe(false) // Currently NaN !== NaN
    expect(deepEqual(0, -0)).toBe(true) // Verify behavior with signed zero
    expect(deepEqual(Infinity, Infinity)).toBe(true)
  })
  it('handles nested values objects with removeUnchanged', () => {
    const obj1 = {
      values: {
        field1: {
          values: {
            nested: { value: 'test' },
          },
        },
      },
    }
    const obj2 = {
      values: {
        field1: {
          values: {
            nested: { value: 'test' },
          },
        },
      },
    }

    const clone1 = JSON.parse(JSON.stringify(obj1))
    const clone2 = JSON.parse(JSON.stringify(obj2))

    expect(deepEqual(clone1, clone2, { removeUnchanged: true })).toBe(true)
    expect(clone1.values).toBeUndefined()
  })
})
