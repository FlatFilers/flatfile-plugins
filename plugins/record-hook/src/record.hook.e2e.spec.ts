import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { bulkRecordHook, recordHook } from './index'

jest.setTimeout(10_000)

describe('recordHook() e2e', () => {
  const listener = setupListener()

  let spaceId
  let sheetId

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      'name',
      'email',
      'notes',
    ])
    sheetId = workbook.sheets[0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe.each([
    recordHook('test', (record) => record.set('name', 'daddy')),
    recordHook('test', async (record) => await record.set('name', 'daddy')),
    bulkRecordHook('test', (records) =>
      records.map((record) => record.set('name', 'daddy'))
    ),
    bulkRecordHook(
      'test',
      async (records) =>
        await Promise.all(records.map((record) => record.set('name', 'daddy')))
    ),
  ])('record created', (fn) => {
    beforeEach(async () => {
      listener.use(fn)
    })

    it('correctly modifies a value', async () => {
      await createRecords(sheetId, [
        {
          name: 'John Doe',
          email: 'john@doe.com',
          notes: 'foobar',
        },
        {
          name: 'Jane Doe',
          email: 'jane@doe.com',
          notes: 'foobar',
        },
      ])

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)
      expect(records[0].values['name']).toMatchObject({ value: 'daddy' })
      expect(records[1].values['name']).toMatchObject({ value: 'daddy' })
    })
  })

  describe('recordHook errors', () => {
    beforeEach(async () => {
      listener.use(
        recordHook('test', (record) => {
          throw new Error('oops')
        })
      )
    })
    it('returns readable error', async () => {
      const logSpy = jest.spyOn(global.console, 'log')
      await createRecords(sheetId, [
        {
          name: 'John Doe',
          email: 'john@doe.com',
          notes: 'foobar',
        },
      ])

      await listener.waitFor('commit:created')

      expect(logSpy).toHaveBeenCalledWith(
        'An error occurred while running the handler: Error: oops'
      )
      logSpy.mockRestore()
    })
  })
})
