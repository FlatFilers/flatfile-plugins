import { Flatfile } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupDriver,
  setupSimpleWorkbook,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { externalSheetConstraint } from './external.sheet.constraint'

describe.skip('externalConstraint()', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

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

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()

    listener.use(
      externalSheetConstraint('test', (values) => {
        if (!values.name || !values.email) {
          throw 'Either name or email must be present'
        }
      })
    )
  })

  afterEach(() => {
    listener.reset()
  })

  it('correctly handles thrown errors', async () => {
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)
    expect(records[0].values['name'].messages?.[0]).toMatchObject({
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
