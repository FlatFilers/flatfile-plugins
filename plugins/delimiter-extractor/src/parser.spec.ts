import { parseBuffer } from './parser'
import * as path from 'path'
import * as fs from 'fs'

describe('parser', () => {
  const psvBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.psv')
  )

  test('PSV to WorkbookCapture', () => {
    expect(parseBuffer(psvBuffer, '|')).toEqual({
      Sheet1: {
        headers: ['Code', 'Details', 'BranchName', 'Tenant'],
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
            Tenant: { value: undefined },
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
  test('hasHeaders', () => {
    const headers = parseBuffer(psvBuffer, '|', { hasHeader: false }).Sheet1
      .headers
    expect(headers).toEqual(['0', '1', '2', '3'])
  })
  test('transform', () => {
    const data = parseBuffer(psvBuffer, '|', {
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
        Tenant: { value: undefined },
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
    const data = parseBuffer(psvBuffer, '|', {
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
        Tenant: { value: undefined },
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
    const data = parseBuffer(psvBuffer, '|', {
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
        Code: { value: '        ' },
        Details: { value: undefined },
        BranchName: { value: undefined },
        Tenant: { value: undefined },
      },
      {
        Code: { value: 'Hospital' },
        Details: { value: 'Hospital' },
        BranchName: { value: 'Department' },
        Tenant: { value: undefined },
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
    parseBuffer(emptyBuffer, '|')
    expect(logSpy).toHaveBeenCalledWith('No data found in the file')
    expect(parseBuffer(emptyBuffer, '|')).toEqual({})
  })
})
