import { parseBuffer } from './parser'
import * as fs from 'fs'
import * as path from 'path'

describe('parser', () => {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.xlsx')
  )
  test('Excel to WorkbookCapture', () => {
    expect(parseBuffer(buffer).Departments).toEqual({
      headers: ['Code', 'Details', 'BranchName', 'Tenant'],
      required: { Code: true, Details: false, BranchName: true, Tenant: true },
      data: [
        {
          Code: { value: 'Personal Care' },
          Details: { value: 'Personal Care Department' },
          BranchName: { value: null },
          Tenant: { value: 'notdata' },
        },
        {
          Code: { value: 'Home Nursing' },
          Details: { value: 'Home Nursing Department' },
          BranchName: { value: null },
          Tenant: { value: 'notdata' },
        },
      ],
    })
  })

  describe('test-basic.xlsx', function () {
    test('finds all the sheet names', () => {
      const capture = parseBuffer(buffer)
      expect(Object.keys(capture)).toEqual(['Departments', 'Clients'])
    })

    test('finds the header names', () => {
      const capture = parseBuffer(buffer)
      expect(capture['Departments'].headers).toEqual([
        'Code',
        'Details',
        'BranchName',
        'Tenant',
      ])
    })

    test('finds values', () => {
      const capture = parseBuffer(buffer)
      expect(capture['Departments'].data.length).toEqual(2)
    })
  })
})
