import { Flatfile } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { externalConstraint } from './external.constraint'

describe('externalConstraint()', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(
      space.id,
      defaultSimpleValueSchema
    )
    sheetId = workbook.sheets![0].id
  })

  beforeEach(() => {
    listener.use(
      externalConstraint('test', (value, key, { config, record }) => {
        if (value === 'John Doe') {
          record.addError(key, 'No Johns please')
          record.set(key, value.toUpperCase())
        }
      })
    )
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('correctly assigns an error', async () => {
    await createRecords(sheetId, defaultSimpleValueData)
    await listener.waitFor('commit:created', 2)
    // Sleep for 1000ms to allow time for the constraint to be applied
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const records = await getRecords(sheetId)
    expect(records[0].values['name'].messages?.[0]).toMatchObject({
      type: 'error',
      message: 'No Johns please',
    })
    expect(records[1].values['name'].messages?.length).toEqual(0)
  })

  it('correctly handles thrown errors', async () => {
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)
    expect(records[0].values['name'].messages?.[0]).toMatchObject({
      type: 'error',
      message: 'No Johns please',
    })
    expect(records[1].values['name'].messages?.length).toEqual(0)
  })

  it('allows setting of values', async () => {
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)
    expect(records[0].values['name'].value).toEqual('JOHN DOE')
  })
})

export const defaultSimpleValueSchema: Array<Flatfile.Property> = [
  {
    key: 'name',
    type: 'string',
    constraints: [
      { type: 'external', validator: 'test', config: { flag: true } },
    ],
  },
  {
    key: 'age',
    type: 'number',
  },
]

export const defaultSimpleValueData = [
  {
    name: 'John Doe',
    age: 1,
  },
  {
    name: 'Jane Doe',
    age: 1,
  },
]
