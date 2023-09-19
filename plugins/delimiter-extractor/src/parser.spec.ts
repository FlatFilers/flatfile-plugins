import * as fs from 'fs'
import * as path from 'path'
import { parseBuffer } from './parser'

describe('parser', () => {
  const colonBasicBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.pound')
  )

  const colonComplexBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-complex.pound')
  )

  test('colon to WorkbookCapture', () => {
    expect(parseBuffer(colonBasicBuffer, { delimiter: '#' })).toEqual({
      Sheet1: {
        headers: ['Code', 'Details', 'BranchName', 'Tenant'],
        required: {
          Code: true,
          Details: false,
          BranchName: false,
          Tenant: false,
        },
        data: [
          {
            Code: { value: 'Personal Care' },
            Details: { value: 'Personal Care' },
            BranchName: { value: 'Department' },
            Tenant: { value: 'notdata' },
          },
          {
            Code: { value: 'Hospital' },
            Details: { value: 'Hospital' },
            BranchName: { value: 'Department' },
          },
          {
            Code: { value: 'Home Nursing' },
            Details: { value: 'Home Nursing' },
            BranchName: { value: 'Department' },
            Tenant: { value: 'false' },
          },
        ],
      },
    })
  })
  it('has headers', () => {
    const headers = parseBuffer(colonBasicBuffer, { delimiter: '#' }).Sheet1
      .headers
    expect(headers).toEqual(['Code', 'Details', 'BranchName', 'Tenant'])
  })
  test('transform', () => {
    const data = parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      transform: (v: string) => {
        return v.toUpperCase()
      },
    }).Sheet1.data
    expect(data).toEqual([
      {
        Code: { value: 'PERSONAL CARE' },
        Details: { value: 'PERSONAL CARE' },
        BranchName: { value: 'DEPARTMENT' },
        Tenant: { value: 'NOTDATA' },
      },
      {
        Code: { value: 'HOSPITAL' },
        Details: { value: 'HOSPITAL' },
        BranchName: { value: 'DEPARTMENT' },
      },
      {
        Code: { value: 'HOME NURSING' },
        Details: { value: 'HOME NURSING' },
        BranchName: { value: 'DEPARTMENT' },
        Tenant: { value: 'FALSE' },
      },
    ])
  })
  test('dynamicTyping', () => {
    const data = parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      dynamicTyping: true,
    }).Sheet1.data
    expect(data).toEqual([
      {
        Code: { value: 'Personal Care' },
        Details: { value: 'Personal Care' },
        BranchName: { value: 'Department' },
        Tenant: { value: 'notdata' },
      },
      {
        Code: { value: 'Hospital' },
        Details: { value: 'Hospital' },
        BranchName: { value: 'Department' },
      },
      {
        Code: { value: 'Home Nursing' },
        Details: { value: 'Home Nursing' },
        BranchName: { value: 'Department' },
        Tenant: { value: false },
      },
    ])
  })
  test('skipEmptyLines', () => {
    const data = parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      skipEmptyLines: true,
    }).Sheet1.data
    expect(data).toEqual([
      {
        Code: { value: 'Personal Care' },
        Details: { value: 'Personal Care' },
        BranchName: { value: 'Department' },
        Tenant: { value: 'notdata' },
      },
      {
        Code: { value: 'Hospital' },
        Details: { value: 'Hospital' },
        BranchName: { value: 'Department' },
      },
      {
        Code: { value: 'Home Nursing' },
        Details: { value: 'Home Nursing' },
        BranchName: { value: 'Department' },
        Tenant: { value: 'false' },
      },
    ])
  })
  test('empty buffer', () => {
    const emptyBuffer = Buffer.from('', 'utf8')
    const logSpy = jest.spyOn(global.console, 'log')
    parseBuffer(emptyBuffer, { delimiter: '#' })
    expect(logSpy).toHaveBeenCalledWith('No data found in the file')
    expect(parseBuffer(emptyBuffer, { delimiter: '#' })).toEqual({})
  })
  test('parsing of basic equals parsing of complex', () => {
    expect(parseBuffer(colonComplexBuffer, { delimiter: '#' })).toEqual(
      parseBuffer(colonBasicBuffer, { delimiter: '#' })
    )
  })
})
