import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('should remove leading and trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('should replace spaces and underscores with hyphens', () => {
    expect(slugify('hello world_foo bar')).toBe('hello-world-foo-bar')
  })

  it('should remove non-word characters', () => {
    expect(slugify('hello@#$%^&*world')).toBe('helloworld')
  })

  it('should remove multiple hyphens and replace with a single one', () => {
    expect(slugify('hello - - - world')).toBe('hello-world')
  })

  it('should not leave trailing or leading hyphens', () => {
    expect(slugify('-hello world-')).toBe('hello-world')
  })

  it('should handle empty strings correctly', () => {
    expect(slugify('')).toBe('')
  })

  it('should handle strings that only consist of non-word characters', () => {
    expect(slugify('@@@$$$%%%^^^&&&***')).toBe('')
  })

  it('should handle a mix of multiple special conditions', () => {
    expect(slugify('  hello--world__foo  @@bar!! ')).toBe('hello-world-foo-bar')
  })

  it('should handle emojis', () => {
    expect(slugify('hello world 👋')).toBe('hello-world')
  })
})
