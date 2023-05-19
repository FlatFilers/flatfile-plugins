import * as fs from 'fs'
import { ExcelExtractor } from './excel.extractor'
import * as path from 'path'
import { FlatfileEvent } from '@flatfile/configure'

describe('ExcelParser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, './test-basic.xlsx')
  )

  const parser = new ExcelExtractor({
    domain: 'upload',
    name: 'upload:completed',
    id: 'dev_ev_45sTvU0GMMNwXmZP',
    context: {
      fileId: 'dev_fl_dZNtPPTa',
      spaceId: 'dev_sp_w2TZIUBE',
      accountId: 'dev_acc_Iafc9fLm',
      environmentId: 'dev_env_rH3SeKkh',
    } as any,
    api: {} as any,
  } as FlatfileEvent)

  describe('test-basic.xlsx', function () {
    test('finds all the sheet names', () => {
      const capture = parser.parseBuffer(buffer)
      expect(Object.keys(capture)).toEqual(['Departments', 'Clients'])
    })

    test('finds the header names', () => {
      const capture = parser.parseBuffer(buffer)
      expect(capture['Departments'].headers).toEqual([
        'Code',
        'Details',
        'BranchName',
        'Tenant',
      ])
    })

    test('finds values', () => {
      const capture = parser.parseBuffer(buffer)
      expect(capture['Departments'].data.length).toEqual(2)
    })
  })
})
