import { WorkbookCapture } from '@flatfile/util-extractor'
import * as fs from 'fs'
import * as path from 'path'
import { beforeAll, describe, expect, test } from 'vitest'
import { parseBuffer } from './parser'
import { GetHeadersResult } from '../constants/headerDetection.const'

describe('parser', () => {
  describe('test-basic.xlsx', () => {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, '../ref/test-basic.xlsx')
    )
    let capture: WorkbookCapture

    // Mock getHeaders function that returns different headers based on sheet content
    const mockGetHeaders = async (
      options: any,
      data: string[][]
    ): Promise<GetHeadersResult> => {
      // Check the first row of data to determine which sheet this is
      const firstRow = data[0] || []
      const secondRow = data[1] || []

      // Departments sheet detection
      if (firstRow.includes('Code') && firstRow.includes('Details')) {
        return {
          header: ['Code', 'Details', 'BranchName', 'Tenant'],
          headerRow: 1,
          letters: ['A', 'B', 'C', 'D'],
        }
      }

      // Rebates-Purchases sheet detection (has many repeated headers)
      if (secondRow[0].includes('Name*') && secondRow[2].includes('Rebates')) {
        return {
          header: [
            'Name',
            'Group',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
            'Rebates',
            'Purchases',
          ],
          headerRow: 2,
          letters: [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
          ],
        }
      }

      // Clients sheet or default
      return {
        header: firstRow.filter(Boolean), // Use the first row as headers, filtering out empty values
        headerRow: 1,
        letters: firstRow.map((_, index) => String.fromCharCode(65 + index)),
      }
    }

    beforeAll(async () => {
      capture = await parseBuffer(buffer, {
        getHeaders: mockGetHeaders,
      })
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
      const mockGetHeaders = async (): Promise<GetHeadersResult> => ({
        header: ['header1', 'header2', 'header3'],
        headerRow: 2, // Assuming headers are in the first row
        letters: ['A', 'B', 'C'],
      })
      const capture = await parseBuffer(buffer, {
        skipEmptyLines: true,
        getHeaders: mockGetHeaders,
      })
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
      // Mock getHeaders function for test-empty-rows.xlsx
      const mockGetHeaders = async (): Promise<GetHeadersResult> => ({
        header: ['header1', 'header2', 'header3'],
        headerRow: 3, // Assuming headers are in the first row
        letters: ['A', 'B', 'C'],
      })
      const capture = await parseBuffer(buffer, {
        skipEmptyLines: false,
        getHeaders: mockGetHeaders,
      })
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
})
