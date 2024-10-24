import { type Flatfile, FlatfileClient } from '@flatfile/api'
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
  vi,
} from 'vitest'
import { type FlatfileRecord } from '.'
import { bulkRecordHook, recordHook } from './record.hook.plugin'

const api = new FlatfileClient()

describe('RecordHook e2e', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)
  })

  afterAll(() => {
    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })

  // Console spies
  const logSpy = vi.spyOn(global.console, 'log')
  const logErrorSpy = vi.spyOn(global.console, 'error')

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'firstName', type: 'string' } as Flatfile.Property.String,
      { key: 'lastName', type: 'string' } as Flatfile.Property.String,
      { key: 'email', type: 'string' } as Flatfile.Property.String,
      { key: 'age', type: 'number' } as Flatfile.Property.Number,
      { key: 'alive', type: 'boolean' } as Flatfile.Property.Boolean,
      {
        key: 'category',
        type: 'enum',
        config: {
          options: [
            {
              value: 'one',
              label: 'One',
            },
            {
              value: 'two',
              label: 'Two',
            },
          ],
        },
      } as Flatfile.Property.Enum,
    ])
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  afterEach(async () => {
    listener.reset()
    logSpy.mockReset()
    logErrorSpy.mockReset()
    const records = await getRecords(sheetId)
    if (records.length > 0) {
      const ids = records.map((record) => record.id)
      await api.records.delete(sheetId, { ids })
    }
  })

  describe('recordHook()', () => {
    it('registers a records:* listener to the client', () => {
      const listenerOnSpy = vi.spyOn(listener, 'on')
      const testCallback = (record) => {
        return record
      }
      listener.use(recordHook('my-sheet-slug', testCallback))
      expect(listenerOnSpy).toHaveBeenCalled()
    })

    it('sets null value', async () => {
      listener.use(
        recordHook('test', (record) => {
          record.set('firstName', null)
        })
      )

      await createRecords(sheetId, [{ firstName: 'John' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['firstName']).toMatchObject({
        value: undefined,
      })
    })

    it('sets primitive values', async () => {
      listener.use(
        recordHook('test', async (record) => {
          await record.set('firstName', 'John')
          await record.set('age', 18)
          await record.set('alive', true)
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['firstName']).toMatchObject({ value: 'John' })
      expect(records[0].values['age']).toMatchObject({ value: 18 })
      expect(records[0].values['alive']).toMatchObject({ value: true })
    })

    it('sets enum value', async () => {
      listener.use(
        recordHook('test', (record) => {
          record.set('category', 'one')
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
    })

    it('sets invalid enum value', async () => {
      listener.use(
        recordHook('test', (record) => {
          record.set('category', 'three')
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeFalsy()
    })

    it('commits record message change', async () => {
      // recordHook will add an error to lastName if firstName is present and lastName is not
      listener.use(
        recordHook('test', (record) => {
          if (!record.get('lastName') && record.get('firstName')) {
            record.addError(
              'lastName',
              'lastName is required if firstName is present'
            )
          }
          return record
        })
      )

      // Create a record with only email
      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      let records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeUndefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(0)

      // Update the record with a first name, recordHook will add an error to lastName
      await api.records.update(sheetId, [
        { id: records[0].id, values: { firstName: { value: 'John' } } },
      ])
      await listener.waitFor('commit:created', 2)

      records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeDefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(1)

      // Update the record with a last name, recordHook will remove the error from lastName
      await api.records.update(sheetId, [
        { id: records[0].id, values: { firstName: { value: undefined } } },
      ])
      await listener.waitFor('commit:created', 3)

      records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeUndefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(0)
    })

    it('noop', async () => {
      listener.use(
        recordHook('test', (_) => null, {
          debug: true,
        })
      )
      await createRecords(sheetId, [{ email: 'john@doe.com' }])

      await listener.waitFor('commit:created')
      expect(logSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-record-hook]:[INFO] No records modified'
      )
    })

    it('sets metadata', async () => {
      listener.use(
        recordHook('test', (record) => record.setMetadata({ test: true }))
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].metadata).toMatchObject({ test: true })
    })

    it('handler error', async () => {
      listener.use(
        recordHook('test', (_) => {
          throw new Error('oops')
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])

      await listener.waitFor('commit:created')
      expect(logErrorSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-record-hook]:[FATAL] oops'
      )
    })
  })

  describe('bulkRecordHook()', () => {
    it('registers a records:* listener to the client', () => {
      const listenerOnSpy = vi.spyOn(listener, 'on')
      const testCallback = (record: FlatfileRecord[]) => {
        return record
      }
      listener.use(bulkRecordHook('my-sheet-slug', testCallback))
      expect(listenerOnSpy).toHaveBeenCalled()
    })

    it('sets null value', async () => {
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            record.set('firstName', null)
          }
        })
      )

      await createRecords(sheetId, [{ firstName: 'John' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['firstName']).toMatchObject({
        value: undefined,
      })
    })

    it('sets primitive values', async () => {
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            await record.set('firstName', 'John')
            await record.set('age', 18)
            await record.set('alive', true)
          }
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['firstName']).toMatchObject({ value: 'John' })
      expect(records[0].values['age']).toMatchObject({ value: 18 })
      expect(records[0].values['alive']).toMatchObject({ value: true })
    })

    it('sets enum value', async () => {
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            record.set('category', 'one')
          }
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
    })

    it('sets invalid enum value', async () => {
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            record.set('category', 'three')
          }
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeFalsy()
    })

    it('commits record message change', async () => {
      // recordHook will add an error to lastName if firstName is present and lastName is not
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            if (!record.get('lastName') && record.get('firstName')) {
              record.addError(
                'lastName',
                'lastName is required if firstName is present'
              )
            }
            return record
          }
        })
      )

      // Create a record with only email
      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      let records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeUndefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(0)

      // Update the record with a first name, recordHook will add an error to lastName
      await api.records.update(sheetId, [
        { id: records[0].id, values: { firstName: { value: 'John' } } },
      ])
      await listener.waitFor('commit:created', 2)

      records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeDefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(1)

      // Update the record with a last name, recordHook will remove the error from lastName
      await api.records.update(sheetId, [
        { id: records[0].id, values: { firstName: { value: undefined } } },
      ])
      await listener.waitFor('commit:created', 3)

      records = await getRecords(sheetId)
      expect(records[0].values['firstName'].value).toBeUndefined()
      expect(records[0].values['lastName'].value).toBeUndefined()
      expect(records[0].values['lastName'].messages?.length).toBe(0)
    })

    it('noop', async () => {
      listener.use(
        bulkRecordHook('test', (_) => null, {
          debug: true,
        })
      )
      await createRecords(sheetId, [{ email: 'john@doe.com' }])

      await listener.waitFor('commit:created')
      expect(logSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-record-hook]:[INFO] No records modified'
      )
    })

    it('sets metadata', async () => {
      listener.use(
        bulkRecordHook('test', async (records) => {
          for (const record of records) {
            record.setMetadata({ test: true })
          }
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].metadata).toMatchObject({ test: true })
    })

    it('handler error', async () => {
      listener.use(
        bulkRecordHook('test', async (_) => {
          throw new Error('oops')
        })
      )

      await createRecords(sheetId, [{ email: 'john@doe.com' }])

      await listener.waitFor('commit:created')
      expect(logErrorSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-record-hook]:[FATAL] oops'
      )
    })

    it('correctly assigns config for record', async () => {
      listener.use(
        bulkRecordHook('test', (records) =>
          records.map((record) => {
            record.setReadOnly()
          })
        )
      )
      await createRecords(sheetId, [{ email: 'foo@bar.com', age: 33 }])

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      expect(records[0].config).toMatchObject({ readonly: true })
    }, 15_000)

    it('correctly assigns config for specific cell', async () => {
      listener.use(
        bulkRecordHook('test', (records) =>
          records.map((record) => {
            record.setReadOnly('age', 'name')
          })
        )
      )

      await createRecords(sheetId, [{ email: 'foo@bar.com', age: 33 }])

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      expect(records[0].config?.fields?.['name'].readonly).toEqual(true)
      expect(records[0].config?.fields?.['age'].readonly).toEqual(true)
    }, 15_000)
  })
})
