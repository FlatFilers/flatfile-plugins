import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it, test, vi } from 'vitest'
import { parseBuffer } from './parser'

describe('parser', () => {
  const colonBasicBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.pound')
  )

  const colonComplexBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-complex.pound')
  )

  const emptyLinesBuffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-empty-lines.txt')
  )

  test('colon to WorkbookCapture', async () => {
    expect(await parseBuffer(colonBasicBuffer, { delimiter: '#' })).toEqual({
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
          },
          {
            Code: { value: 'Home Nursing' },
            Details: { value: 'Home Nursing' },
            BranchName: { value: 'Department' },
            Tenant: { value: 'false' },
          },
        ],
        metadata: undefined,
      },
    })
  })
  it('has headers', async () => {
    const parsedBuffer = await parseBuffer(colonBasicBuffer, { delimiter: '#' })
    const headers = parsedBuffer.Sheet1.headers
    expect(headers).toEqual(['Code', 'Details', 'BranchName', 'Tenant'])
  })
  test('transform', async () => {
    const parsedBuffer = await parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      transform: (v: string) => {
        return v.toUpperCase()
      },
    })
    const data = parsedBuffer.Sheet1.data
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
  test('dynamicTyping', async () => {
    const parsedBuffer = await parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      dynamicTyping: true,
    })
    const data = parsedBuffer.Sheet1.data
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
  test('skipEmptyLines', async () => {
    const parsedBuffer = await parseBuffer(colonBasicBuffer, {
      delimiter: '#',
      skipEmptyLines: true,
    })
    const data = parsedBuffer.Sheet1.data
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
  test('empty buffer', async () => {
    const emptyBuffer = Buffer.from('', 'utf8')
    const logSpy = vi.spyOn(global.console, 'log')
    const parsedBuffer = await parseBuffer(emptyBuffer, { delimiter: '#' })
    expect(logSpy).toHaveBeenCalledWith('No data found in the file')
    expect(parsedBuffer).toEqual({})
  })
  test('parsing of basic equals parsing of complex', async () => {
    const basicResult = await parseBuffer(colonBasicBuffer, { delimiter: '#' })
    const complexResult = await parseBuffer(colonComplexBuffer, {
      delimiter: '#',
      skipEmptyLines: 'greedy',
    })

    expect(complexResult).toEqual(basicResult)
  })
  test('skip empty lines: true', async () => {
    const parsedBuffer = await parseBuffer(emptyLinesBuffer, {
      delimiter: ',',
      skipEmptyLines: true,
    })
    const data = parsedBuffer.Sheet1.data
    expect(data).toEqual([
      {
        header1: { value: 'column1' },
        header2: { value: 'column2' },
        header3: { value: 'column3' },
      },
      {
        header1: { value: ' ' },
        header2: { value: ' ' },
        header3: { value: ' ' },
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
  test('skip empty lines: greedy', async () => {
    const parsedBuffer = await parseBuffer(emptyLinesBuffer, {
      delimiter: ',',
      skipEmptyLines: 'greedy',
    })
    const data = parsedBuffer.Sheet1.data
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
  test('skip empty lines: false', async () => {
    const parsedBuffer = await parseBuffer(emptyLinesBuffer, {
      delimiter: ',',
      skipEmptyLines: false,
    })
    const data = parsedBuffer.Sheet1.data
    expect(data).toEqual([
      {
        header1: { value: 'column1' },
        header2: { value: 'column2' },
        header3: { value: 'column3' },
      },
      {
        header1: { value: ' ' },
        header2: { value: ' ' },
        header3: { value: ' ' },
      },
      {
        header1: { value: '' },
        header2: { value: '' },
        header3: { value: '' },
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
})
