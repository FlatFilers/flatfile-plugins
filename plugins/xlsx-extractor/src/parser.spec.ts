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
      required: { Code: true, Details: false, BranchName: true, Tenant: true },
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

    test('required columns are marked', () => {
      expect(capture['Departments'].required).toEqual({
        Code: true,
        Details: false,
        BranchName: true,
        Tenant: true,
      })
      expect(capture['Clients'].required).toEqual({
        Id: true,
        FirstName: true,
        LastName: true,
        Salutation: false,
        Address: false,
        'Suite Number': false,
        City: false,
        Province: false,
        Country: false,
        PostalCode: false,
        MainPhoneNumber: false,
        PersonalPhoneNumber: false,
        OtherPhoneNumber: false,
        FaxNumber: false,
        EmailAddress: false,
        Password: false,
        DateOfBirth: false,
        Gender: false,
        Remarks: false,
        HealthCardNumber: false,
        CostCentreNumber: false,
        Timezone: false,
        preferred_language: false,
        BranchName: true,
        Tenant: true,
        'referral source': false,
      })
      expect(capture['Rebates-Purchases'].required).toEqual({
        Name: true,
        Group: true,
        Rebates: false,
        Purchases: false,
        Rebates_1: false,
        Purchases_1: false,
        Rebates_2: false,
        Purchases_2: false,
        Rebates_3: false,
        Purchases_3: false,
        Rebates_4: false,
        Purchases_4: false,
        Rebates_5: false,
        Purchases_5: false,
        Rebates_6: false,
        Purchases_6: false,
        Rebates_7: false,
        Purchases_7: false,
        Rebates_8: false,
        Purchases_8: false,
        Rebates_9: false,
        Purchases_9: false,
        Rebates_10: false,
        Purchases_10: false,
        Rebates_11: false,
        Purchases_11: false,
      })
    })
  })
})
