import { WorkbookCapture } from '@flatfile/util-extractor'
import * as fs from 'fs'
import * as path from 'path'
import { parseBuffer } from './parser'

describe('parser', () => {
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
