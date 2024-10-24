import { describe, expect, it } from 'vitest'
import { records } from './fake.data'
import { keepFirst } from './keep.first.logic'

describe('keepFirst()', () => {
  it('keepFirst()', () => {
    let uniques = new Set()
    const removeThese = keepFirst(records, 'email', uniques)
    expect(removeThese).toEqual(['recordId:5'])
  })
})
