import { describe, expect, it, vi } from 'vitest'
import { generateField } from './generate.field'

describe('generateField', () => {
  it('should generate a base property for scalar types', () => {
    const field = {
      name: 'age',
      type: { kind: 'SCALAR', name: 'Int' },
      description: 'Age of the person',
    }
    const expected = {
      key: 'age',
      label: 'age',
      type: 'number',
      description: 'Age of the person',
      constraints: [],
    }

    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should include required constraint for NON_NULL scalar types', () => {
    const field = {
      name: 'age',
      type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Int' } },
      description: 'Age of the person',
    }
    const expected = {
      key: 'age',
      label: 'age',
      type: 'number',
      description: 'Age of the person',
      constraints: [{ type: 'required' }],
    }

    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should generate a reference property for object types', () => {
    const field = {
      name: 'parent',
      type: { kind: 'OBJECT', name: 'Person' },
      description: 'Parent of the person',
    }
    const expected = {
      key: 'parent',
      label: 'parent',
      type: 'reference',
      description: 'Parent of the person',
      constraints: [],
      config: { ref: 'Person', key: 'id', relationship: 'has-one' },
    }

    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should handle unsupported field types by returning null', () => {
    const field = {
      name: 'unknown',
      type: { kind: 'UNSUPPORTED' },
      description: 'An unsupported field',
    }
    const consoleSpy = vi.spyOn(console, 'log')

    expect(generateField(field, 'TestSheet')).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      "Field 'unknown' on 'TestSheet' skipped because 'UNSUPPORTED' is unsupported."
    )
  })

  it('should handle recursive NON_NULL object types', () => {
    const field = {
      name: 'parent',
      type: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Person' } },
      description: 'Parent of the person',
    }
    const expected = {
      key: 'parent',
      label: 'parent',
      type: 'reference',
      description: 'Parent of the person',
      constraints: [{ type: 'required' }],
      config: { ref: 'Person', key: 'id', relationship: 'has-one' },
    }

    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should handle fields with undefined descriptions', () => {
    const field = { name: 'age', type: { kind: 'SCALAR', name: 'Int' } }
    const expected = {
      key: 'age',
      label: 'age',
      type: 'number',
      description: '',
      constraints: [],
    }
    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should handle fields with undefined descriptions', () => {
    const field = { name: 'age', type: { kind: 'SCALAR', name: 'Int' } }
    const expected = {
      key: 'age',
      label: 'age',
      type: 'number',
      description: '',
      constraints: [],
    }
    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should generate a string property for scalar string types', () => {
    const field = {
      name: 'name',
      type: { kind: 'SCALAR', name: 'String' },
      description: 'Name of the person',
    }
    const expected = {
      key: 'name',
      label: 'name',
      type: 'string',
      description: 'Name of the person',
      constraints: [],
    }
    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should generate a property for ID scalar types', () => {
    const field = {
      name: 'id',
      type: { kind: 'SCALAR', name: 'ID' },
      description: 'ID of the person',
    }
    const expected = {
      key: 'id',
      label: 'id',
      type: 'string',
      description: 'ID of the person',
      constraints: [],
    }
    expect(generateField(field, 'Person')).toEqual(expected)
  })

  it('should return null and log for unrecognized field types', () => {
    const field = {
      name: 'weirdType',
      type: { kind: 'STRANGE', name: 'StrangeType' },
      description: 'A strange field',
    }
    const consoleSpy = vi.spyOn(console, 'log')
    expect(generateField(field, 'WeirdSheet')).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("'STRANGE' is unsupported.")
    )
  })
})
