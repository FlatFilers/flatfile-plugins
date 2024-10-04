import { Flatfile } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { externalSheetConstraint } from './external.sheet.constraint'

describe('externalConstraint()', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(
      space.id,
      defaultSimpleValueSchema,
      [
        {
          type: 'external',
          validator: 'test',
          fields: ['name', 'email'],
          config: { flag: true },
        },
      ]
    )
    sheetId = workbook.sheets![0].id
  })

  beforeEach(() => {
    listener.use(
      externalSheetConstraint('test', (values) => {
        if (!values.name || !values.email) {
          throw 'Either name or email must be present'
        }
      })
    )
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('correctly handles thrown errors', async () => {
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created', 2)
    const records = await getRecords(sheetId)
    expect(records[0].values['name'].messages[0]).toMatchObject({
      type: 'error',
      message: 'Either name or email must be present',
    })
  })
})

export const defaultSimpleValueSchema: Array<Flatfile.Property> = [
  {
    key: 'name',
    type: 'string',
  },
  {
    key: 'age',
    type: 'number',
  },
  {
    key: 'email',
    type: 'string',
  },
]

export const defaultSimpleValueData = [
  {
    name: 'John Doe',
    age: 1,
    email: null,
  },
  {
    name: null,
    age: 1,
    email: 'jane.doe@gmail.com',
  },
]
