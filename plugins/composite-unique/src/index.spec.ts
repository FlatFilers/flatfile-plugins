import { CompositeFieldOptions, CompositeProperty, compositeUniquePlugin } from '.'

import {
  setupListener,
  setupSpace,
  setupSimpleWorkbook,
  deleteSpace,
  createRecords,
  getRecords,
} from '@flatfile/utils-testing'
import { Flatfile } from '@flatfile/api'

const testSheetFields: Array<Flatfile.Property> = [
  {
    key: 'field1',
    type: 'string',
  },
  {
    key: 'field2',
    type: 'string',
  },
  {
    key: 'combo1',
    type: 'string',
    constraints: [{ type: 'unique' }],
  },
  {
    key: 'combo2',
    type: 'string',
    constraints: [{ type: 'unique' }],
  },
]

const testSheetValues = [
  {
    field1: 'Alex',
    field2: 'Joe',
    combo1: '',
    combo2: '',
  },
  {
    field1: 'Chase',
    field2: 'Gerald',
    combo1: '',
    combo2: '',
  },
  {
    field1: '',
    field2: 'AlexJoe',
    combo1: '',
    combo2: '',
  },
]

describe('compositeUniquePlugin', () => {
  //   test('it creates a recordHook with the correct sheet name', () => {
  //     const testListener = FlatfileListener.create((listener) => {})
  //     const listenerUseSpy = jest.spyOn(testListener, 'use')
  //     const testOptions: CompositeFieldOptions = {
  //       sheetSlug: 'my-sheet',
  //       name: 'testName',
  //       fields: ['field1', 'field2'],
  //       source: async ({ fields, record }) => fields.join(''),
  //     }
  //     compositeUniquePlugin(testOptions)(testListener)

  //     expect(listenerUseSpy).toHaveBeenCalled()
  //   })

  //   test('it sets the correct value on the record when source is provided', async () => {
  //     const testListener = FlatfileListener.create((listener) => {})
  //     const testRecord = new FlatfileRecord({
  //       rawData: {
  //         field1: {
  //           value: 'value1',
  //           links: [],
  //         },
  //         field2: { value: 'value2', links: [] },
  //       },
  //       rowId: 1,
  //     })
  //     const testOptions: CompositeFieldOptions = {
  //       sheetSlug: 'my-sheet',
  //       name: 'testName',
  //       fields: ['field1', 'field2'],
  //       source: async ({ fields, record }) => fields.join(''),
  //     }
  //     await compositeUniquePlugin(testOptions)(testListener)
  //     expect(testRecord.get('testName')).toBe('value1value2')
  //   })

  //   test('it sets the correct value on the record when source is not provided', async () => {
  //     const testListener = FlatfileListener.create((listener) => {})
  //     const testRecord = new FlatfileRecord({
  //       rawData: {
  //         field1: {
  //           value: 'value1',
  //           links: [],
  //         },
  //         field2: { value: 'value2', links: [] },
  //       },
  //       rowId: 1,
  //     })
  //     const testOptions: CompositeFieldOptions = {
  //       sheetSlug: 'my-sheet',
  //       name: 'testName',
  //       fields: ['field1', 'field2'],
  //     }
  //     await compositeUniquePlugin(testOptions)(testListener)
  //     expect(testRecord.get('testName')).toBe('value1value2')
  //   })
  const listener = setupListener()

  let spaceId
  let sheetId

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, testSheetFields)
    console.dir(workbook, { depth: null })
    sheetId = workbook.sheets[0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('Creates composite field value properly', () => {
    it('correctly combines fields if no source is provided', async () => {
      const field: CompositeProperty = {
        key: 'combo1',
        type: 'composite',
        constraints: [{ type: 'unique' }],
        config: {
          sources: ['field1', 'field2'],
        },
      }

      const testOptions1: CompositeFieldOptions = {
        sheetSlug: 'test',
        field
      }

      listener.use(compositeUniquePlugin(testOptions1))

      await createRecords(sheetId, testSheetValues)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      // console.dir(records, { depth: null })
      expect(records[0].values['combo1'].value).toBe('AlexJoe')
      expect(records[1].values['combo1'].value).toBe('ChaseGerald')
    })

    it('correctly performs source combination', async () => {
      const field: CompositeProperty = {
        key: 'combo2',
        type: 'composite',
        constraints: [{ type: 'unique' }],
        config: {
          sources: ['field1', 'field2'],
        },
      }

      const testOptions2: CompositeFieldOptions = {
        sheetSlug: 'test',
        field,
        handler: async ({ fields, record }) => 'HotDog',
      }

      listener.use(compositeUniquePlugin(testOptions2))

      await createRecords(sheetId, testSheetValues)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)
      // console.dir(records, { depth: null })

      expect(records[3].values['combo2'].value).toBe('HotDog')
      expect(records[4].values['combo2'].value).toBe('HotDog')
    })
  })
})
