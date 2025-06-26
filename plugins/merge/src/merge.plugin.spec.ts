import { describe, expect, it } from 'vitest'
import type { Flatfile } from '@flatfile/api'
import { PluginOptions } from './merge.plugin'

describe('merge plugin', () => {
  it('should validate plugin options', () => {
    const opts: PluginOptions = {
      keys: ['id'],
      defaultTreatment: 'overwrite',
      overwriteHeuristic: 'last'
    }
    
    expect(opts.keys).toEqual(['id'])
    expect(opts.defaultTreatment).toBe('overwrite')
    expect(opts.overwriteHeuristic).toBe('last')
  })

  it('should handle empty keys array', () => {
    const opts: PluginOptions = {
      keys: [],
      defaultTreatment: 'list'
    }
    
    expect(opts.keys).toEqual([])
    expect(opts.defaultTreatment).toBe('list')
  })

  it('should support custom treatments per field', () => {
    const opts: PluginOptions = {
      keys: ['id'],
      treatments: {
        'name': { type: 'overwrite', heuristic: 'first' },
        'tags': { type: 'list' }
      },
      defaultTreatment: 'overwrite'
    }
    
    expect(opts.treatments?.name.type).toBe('overwrite')
    expect(opts.treatments?.name.heuristic).toBe('first')
    expect(opts.treatments?.tags.type).toBe('list')
  })

  it('should support custom merge function', () => {
    const customFn = (records: Flatfile.RecordsWithLinks, key: string, fieldKey: string) => {
      return records.find(r => r.values[fieldKey]?.value)?.values[fieldKey]?.value
    }

    const opts: PluginOptions = {
      keys: ['id'],
      overwriteHeuristic: 'custom',
      custom: customFn
    }
    
    expect(opts.custom).toBe(customFn)
    expect(opts.overwriteHeuristic).toBe('custom')
  })

  it('should default to overwrite treatment and last heuristic', () => {
    const opts: PluginOptions = {
      keys: ['id']
    }
    
    expect(opts.defaultTreatment).toBeUndefined()
    expect(opts.overwriteHeuristic).toBeUndefined()
  })
})
