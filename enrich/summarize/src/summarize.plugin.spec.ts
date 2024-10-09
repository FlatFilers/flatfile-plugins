import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { summarize } from './summarize.plugin'

const api = new FlatfileClient()

describe('Text Summarization Plugin', () => {
  const listener = setupListener()
  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'content', type: 'string' },
      { key: 'summary', type: 'string' },
      { key: 'key_phrases', type: 'string' },
    ])
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  afterEach(async () => {
    listener.reset()
    const records = await getRecords(sheetId)
    if (records.length > 0) {
      const ids = records.map((record) => record.id)
      await api.records.delete(sheetId, { ids })
    }
  })

  describe('summarize()', () => {
    const mockConfig = {
      sheetSlug: 'test',
      contentField: 'content',
      summaryField: 'summary',
      keyPhrasesField: 'key_phrases',
      summaryLength: 2,
    }

    it('should add summary and key phrases to the record', async () => {
      listener.use(summarize(mockConfig))

      await createRecords(sheetId, [
        {
          content:
            'This is a test sentence. This is another test sentence. And a third one for good measure.',
        },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['summary'].value).toBeDefined()
      expect(records[0].values['key_phrases'].value).toBeDefined()
      expect(
        (records[0].values['summary'].value as string).split('.').length
      ).toBe(6)
    })

    it('should handle empty content fields', async () => {
      listener.use(summarize(mockConfig))

      await createRecords(sheetId, [{ content: '' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['summary'].value).toBeUndefined()
      expect(records[0].values['key_phrases'].value).toBeUndefined()
      expect(records[0].values['content'].messages).toContainEqual(
        expect.objectContaining({
          message: 'Content is required for summarization',
        })
      )
    })
  })
})
