import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'

import { recordHook } from '..'

import {
  defaultSimpleValueData,
  defaultSimpleValueSchema,
} from './simpleTestData'

const messageValue = 'this is a name'

describe('recordHook() simple data modification e2e', () => {
  const listener = setupListener()

  let spaceId
  let sheetId

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(
      space.id,
      defaultSimpleValueSchema
    )
    sheetId = workbook.sheets[0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('Assigns metadata without assigning a new value', () => {
    it('correctly assigns metadata', async () => {
      listener.use(
        recordHook('test', (record) => {
          record.addInfo('name', messageValue)
        })
      )
      await createRecords(sheetId, defaultSimpleValueData)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)
      console.dir(records[records.length - 2].values['name'].messages)
      expect(
        records[records.length - 2].values['name'].messages[0]
      ).toMatchObject({ type: 'info', message: messageValue })
      expect(
        records[records.length - 1].values['name'].messages[0]
      ).toMatchObject({ type: 'info', message: messageValue })
    })
  })
})