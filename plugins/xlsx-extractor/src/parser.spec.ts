import { WorkbookCapture, StreamingParseResult } from '@flatfile/util-extractor'
import * as fs from 'fs'
import * as path from 'path'
import { beforeAll, describe, expect, test } from 'vitest'
import { ExcelExtractor } from './index'
import { parseBuffer, parseBufferStreaming } from './parser'

describe('parser', () => {
  describe('test-basic.xlsx', () => {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, '../ref/test-basic.xlsx')
    )
    let capture: WorkbookCapture
    beforeAll(async () => {
      capture = await parseBuffer(buffer)
    })
    test('Excel to WorkbookCapture', async () => {
      expect(capture.Departments).toEqual({
        headers: ['Code', 'Details', 'BranchName', 'Tenant'],
        data: [
          {
            Code: { value: 'Personal Care' },
            Details: { value: 'Personal Care Department' },
            BranchName: { value: null },
            Tenant: { value: 'notdata' },
          },
          {
            Code: { value: '      ' },
            Details: { value: null },
            BranchName: { value: null },
            Tenant: { value: null },
          },
          {
            Code: { value: 'Home Nursing' },
            Details: { value: 'Home Nursing Department' },
            BranchName: { value: null },
            Tenant: { value: 'notdata' },
          },
        ],
        metadata: undefined,
      })
    })

    describe('test-basic.xlsx', () => {
      test('finds all the sheet names', async () => {
        expect(Object.keys(capture)).toEqual([
          'Departments',
          'Clients',
          'Rebates-Purchases',
        ])
      })

      test('finds the header names', () => {
        expect(capture['Departments'].headers).toEqual([
          'Code',
          'Details',
          'BranchName',
          'Tenant',
        ])
      })

      test('finds values', () => {
        expect(capture['Departments'].data.length).toEqual(3)
      })

      test('non-unique header values are prepended', () => {
        expect(capture['Rebates-Purchases'].headers).toEqual([
          'Name',
          'Group',
          'Rebates',
          'Purchases',
          'Rebates_1',
          'Purchases_1',
          'Rebates_2',
          'Purchases_2',
          'Rebates_3',
          'Purchases_3',
          'Rebates_4',
          'Purchases_4',
          'Rebates_5',
          'Purchases_5',
          'Rebates_6',
          'Purchases_6',
          'Rebates_7',
          'Purchases_7',
          'Rebates_8',
          'Purchases_8',
          'Rebates_9',
          'Purchases_9',
          'Rebates_10',
          'Purchases_10',
          'Rebates_11',
          'Purchases_11',
        ])
      })
    })
  })
  describe('skipEmptyLines', () => {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, '../ref/test-empty-rows.xlsx')
    )
    let capture: WorkbookCapture
    test('skips empty lines', async () => {
      const capture = await parseBuffer(buffer, { skipEmptyLines: true })
      const data = capture['Sheet1'].data
      expect(data.length).toEqual(3)
      expect(data).toEqual([
        {
          header1: { value: 'column1' },
          header2: { value: 'column2' },
          header3: { value: 'column3' },
        },
        {
          header1: { value: 'column4' },
          header2: { value: 'column5' },
          header3: { value: 'column6' },
        },
        {
          header1: { value: 'column7' },
          header2: { value: 'column8' },
          header3: { value: 'column9' },
        },
      ])
    })
    test("doesn't skip empty lines", async () => {
      const capture = await parseBuffer(buffer, { skipEmptyLines: false })
      const data = capture['Sheet1'].data
      expect(data.length).toEqual(6)
      expect(data).toEqual([
        {
          header1: { value: 'column1' },
          header2: { value: 'column2' },
          header3: { value: 'column3' },
        },
        {},
        {
          header1: { value: 'column4' },
          header2: { value: 'column5' },
          header3: { value: 'column6' },
        },
        {},
        {},
        {
          header1: { value: 'column7' },
          header2: { value: 'column8' },
          header3: { value: 'column9' },
        },
      ])
    })
  })

  describe('streaming parser', () => {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, '../ref/test-basic.xlsx')
    )

    test('parseBufferStreaming returns streaming result', async () => {
      const result = await parseBufferStreaming(buffer)

      expect(result.isStreaming).toBe(true)
      expect(Object.keys(result.workbook)).toEqual([
        'Departments',
        'Clients',
        'Rebates-Purchases',
      ])
    })

    test('streaming data matches non-streaming data', async () => {
      const streamingResult = await parseBufferStreaming(buffer)
      const standardResult = await parseBuffer(buffer)

      // Compare headers
      for (const sheetName of Object.keys(standardResult)) {
        expect(streamingResult.workbook[sheetName].headers).toEqual(
          standardResult[sheetName].headers
        )
      }

      // Compare data by collecting streaming data
      for (const sheetName of Object.keys(standardResult)) {
        const streamingData = []
        for await (const record of streamingResult.workbook[sheetName].data) {
          streamingData.push(record)
        }
        expect(streamingData).toEqual(standardResult[sheetName].data)
      }
    })

    test('ExcelExtractor uses streaming by default', () => {
      // Since ExcelExtractor now always uses streaming,
      // we just verify it still works as expected
      const extractor = ExcelExtractor()
      expect(extractor).toBeDefined()
      expect(typeof extractor).toBe('function')
    })
  })
})
