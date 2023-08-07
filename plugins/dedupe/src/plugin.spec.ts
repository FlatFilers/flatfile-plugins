import { Flatfile } from '@flatfile/api'
import { faker } from '@faker-js/faker'

import { keepFirst, keepLast } from './plugin'

interface Context {
  records: Flatfile.RecordsWithLinks
}

describe('Dedupe', () => {
  const context: Context = {
    records: [
      {
        id: 'recordId:1',
        values: {
          first_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          last_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          email: {
            value: 'foo@bar.com',
            messages: [],
            valid: true,
          },
        },
        valid: true,
        metadata: {},
      },
      {
        id: 'recordId:2',
        values: {
          first_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          last_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          email: {
            value: null,
            messages: [],
            valid: true,
          },
        },
        valid: true,
        metadata: {},
      },
      {
        id: 'recordId:3',
        values: {
          first_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          last_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          email: {
            value: faker.internet.email(),
            messages: [],
            valid: true,
          },
        },
        valid: true,
        metadata: {},
      },
      {
        id: 'recordId:4',
        values: {
          first_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          last_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          email: {
            value: faker.internet.email(),
            messages: [],
            valid: true,
          },
        },
        valid: true,
        metadata: {},
      },
      {
        id: 'recordId:5',
        values: {
          first_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          last_name: {
            value: faker.lorem.word(),
            messages: [],
            valid: true,
          },
          email: {
            value: 'foo@bar.com',
            messages: [],
            valid: true,
          },
        },
        valid: true,
        metadata: {},
      },
    ],
  }

  it('keepFirst()', () => {
    const removeThese = keepFirst(context.records, 'email')

    expect(removeThese).toEqual(['recordId:5'])
  })

  it('keepLast()', () => {
    const removeThese = keepLast(context.records, 'email')

    expect(removeThese).toEqual(['recordId:1'])
  })
})
