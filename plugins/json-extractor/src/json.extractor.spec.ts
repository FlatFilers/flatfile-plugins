import { JSONExtractor } from './json.extractor'
import { Flatfile } from '@flatfile/api'
import * as path from 'path'
import * as fs from 'fs'

describe('JSONParser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.json')
  )

  const parser = new JSONExtractor({
    id: 'some_id',
    topic: Flatfile.EventTopic.FileCreated,
    payload: {} as Record<string, unknown>,
    createdAt: new Date(),
    domain: 'space',
    name: 'upload:completed',
    context: {
      fileId: 'dev_fl_dZNtPPTa',
      spaceId: 'dev_sp_w2TZIUBE',
      accountId: 'dev_acc_Iafc9fLm',
      environmentId: 'dev_env_rH3SeKkh',
    } as any,
    api: {} as any,
  } as Flatfile.UploadCompletedEvent)

  describe('test-basic.json', function () {
    test('finds the sheet name', () => {
      const capture = parser.parseBuffer(buffer)
      const sheetNames = capture ? Object.keys(capture) : []
      expect(sheetNames).toEqual(['Sheet1'])
    })

    test('finds the header names', () => {
      const capture = parser.parseBuffer(buffer)
      const headers =
        capture && capture['Sheet1'] ? capture['Sheet1'].headers : []
      expect(headers).toHaveLength(3) // Assuming there are 3 headers
    })

    test('finds values', () => {
      const capture = parser.parseBuffer(buffer)
      const data: Record<string, any> | [] =
        capture && capture['Sheet1'] ? capture['Sheet1'].data : []
      expect(data.length).toBeGreaterThan(0) // Assuming there's at least one row
    })
  })
})
