import { DelimiterExtractor } from './delimiter.extractor'
import { Flatfile } from '@flatfile/api'
import * as fs from 'fs'
import * as path from 'path'

describe('PsvParser', function () {
  describe.each([
    ['psv', 'pipe', { hasHeader: true }],
    ['csv', 'comma', { hasHeader: true }],
    ['tsv', 'tab', { hasHeader: true }],
    ['txt', 'tilde', { hasHeader: true }],
    [
      'psv',
      'pipe',
      {
        hasHeader: false,
        transform: (value: string) => value.toUpperCase(),
      },
    ],
    [
      'csv',
      'comma',
      {
        hasHeader: false,
        transform: (value: string) => value.toUpperCase(),
      },
    ],
    [
      'tsv',
      'tab',
      {
        hasHeader: false,
        transform: (value: string) => value.toUpperCase(),
      },
    ],
  ])('test-basic.*', function (fileExt, delimiter, options) {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, `../ref/test-basic.${fileExt}`)
    )

    const parser = new DelimiterExtractor(
      {
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
      } as Flatfile.UploadCompletedEvent,
      delimiter,
      fileExt,
      {
        ...options,
      }
    )
    test('finds the sheet name', () => {
      const capture = parser.parseBuffer(buffer)
      const sheetNames = Object.keys(capture)
      expect(sheetNames).toEqual(['Sheet1'])
    })

    test('finds the header names', () => {
      const capture = parser.parseBuffer(buffer)
      const headers = capture['Sheet1'].headers
      expect(headers).toHaveLength(4)
    })

    test('finds values', () => {
      const capture = parser.parseBuffer(buffer)
      const data: Record<string, any> = capture['Sheet1'].data
      expect(data.length).toBe(options?.hasHeader ? 2 : 3)
    })

    if (options.hasOwnProperty('transform')) {
      test('values transformed', () => {
        const capture = parser.parseBuffer(buffer)
        const data: Record<string, any> = capture['Sheet1'].data
        expect(data[0][0]).toBe('CODE')
      })
    }
  })
})
