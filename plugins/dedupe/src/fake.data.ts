import type { Flatfile } from '@flatfile/api'

import { faker } from '@faker-js/faker'

export const records: Flatfile.RecordsWithLinks = [
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
]
