import { Flatfile } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { storedConstraint } from './stored.constraint'
import * as utils from './utils'

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getAppConstraints: jest.fn(),
}))

describe('storedConstraint()', () => {
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
    listener.use(storedConstraint);
    (utils.getAppConstraints as jest.Mock).mockResolvedValue({
      data: [
        { type: 'stored', validator: 'test', function: 'function constraint() {}' },
      ],
    })
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('correctly assigns an error', async () => {
  })

  it('correctly handles thrown errors', async () => {
  })

  it('allows setting of values', async () => {
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
