import { transform, transformIfPresent, validate, compute } from '.'
import { FlatfileRecord } from '@flatfile/hooks'

describe('compute', () => {
  test('it computes a new value for a field based on its current value', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
      },
      rowId: 0,
    })
    compute(
      record,
      'firstName',
      (value) => value && value.toString().toLowerCase()
    )
    expect(record.get('firstName')).toBe('alex')
  })

  test('it takes an optional message and sets it on compute', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
      },
      rowId: 0,
    })
    compute(
      record,
      'firstName',
      (value) => value && value.toString().toLowerCase(),
      'First name was changed to lower case.'
    )
    expect(record.get('firstName')).toBe('alex')
    const messages = record.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'firstName',
      level: 'info',
      message: 'First name was changed to lower case.',
    })
  })
})

describe('transform', () => {
  test('it computes a new value for a field based on other field values', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck',
        fullName: null,
      },
      rowId: 0,
    })
    transform(
      record,
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`
    )
    expect(record.get('fullName')).toBe('Alex Hollenbeck')
  })

  test('it takes an optional message and sets it on transform', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck',
        fullName: null,
      },
      rowId: 0,
    })
    transform(
      record,
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      'Full name was computed from first name and last name.'
    )
    expect(record.get('fullName')).toBe('Alex Hollenbeck')
    const messages = record.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'fullName',
      level: 'info',
      message: 'Full name was computed from first name and last name.',
    })
  })
})

describe('transformIfPresent', () => {
  test('it computes a new value for a field based on other field values when required fields are present', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck',
        fullName: null,
      },
      rowId: 0,
    })
    transformIfPresent(
      record,
      ['firstName', 'lastName'],
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`
    )
    expect(record.get('fullName')).toBe('Alex Hollenbeck')
  })

  test('it takes an optional message and setes it when required fields are present', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck',
        fullName: null,
      },
      rowId: 0,
    })
    transformIfPresent(
      record,
      ['firstName', 'lastName'],
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      'Full name was computed from first name and last name.'
    )
    expect(record.get('fullName')).toBe('Alex Hollenbeck')
    const messages = record.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'fullName',
      level: 'info',
      message: 'Full name was computed from first name and last name.',
    })
  })

  test('it does nothing when a required field is not present', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: null,
        fullName: null,
      },
      rowId: 0,
    })
    transformIfPresent(
      record,
      ['firstName', 'lastName'],
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      'Full name was computed from first name and last name.'
    )
    expect(record.get('fullName')).toBe(null)
    const messages = record.toJSON().info
    expect(messages.length).toBe(0)
  })
})

describe('validate', () => {
  test('it adds an error message when the validate condition is not met', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck123',
        fullName: null,
      },
      rowId: 0,
    })
    validate(
      record,
      'lastName',
      (value) => {
        return !/\d/.test(value.toString())
      },
      'Last name cannot contain numbers'
    )
    const messages = record.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'lastName',
      level: 'error',
      message: 'Last name cannot contain numbers',
    })
  })

  test('it does nothing when the validate condition is met', () => {
    const record = new FlatfileRecord({
      rawData: {
        firstName: 'Alex',
        lastName: 'Hollenbeck',
        fullName: null,
      },
      rowId: 0,
    })
    validate(
      record,
      'lastName',
      (value) => {
        return !/\d/.test(value.toString())
      },
      'Last name cannot contain numbers'
    )
    const messages = record.toJSON().info
    expect(messages.length).toBe(0)
  })
})
