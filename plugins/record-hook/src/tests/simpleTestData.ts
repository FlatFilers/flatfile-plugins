import { Flatfile } from "@flatfile/api"
import { FlatfileRecord } from "@flatfile/hooks"

export const defaultSimpleValueSchema: Array<Flatfile.Property> = [
  {
    key: "name",
    type: 'string'
  },
  {
    key: "age",
    type: 'number'
  },
  {
    key: "alive",
    type: 'boolean'
  },
  {
    key: "email",
    type: 'string'
  },
  {
    key: "notes",
    type: 'string'
  },
]

export const defaultSimpleValueData = [
  {
    name: 'John Doe',
    age: 1,
    alive: true,
    email: 'john@doe.com',
    notes: 'foobar',
  },
  {
    name: 'Jane Doe',
    age: 1,
    alive: true,
    email: 'jane@doe.com',
    notes: 'foobar',
  }
]