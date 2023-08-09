import { parseBuffer } from './parser'
import * as path from 'path'
import * as fs from 'fs'

describe('parser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.json')
  )

  test('JSON to WorkbookCapture', () => {
    const capture = parseBuffer(buffer)
    expect(capture).toEqual({
      Sheet1: {
        headers: ['First Name', 'Last Name', 'Email'],
        data: [
          {
            'First Name': { value: 'Tony' },
            'Last Name': { value: 'Lamb' },
            Email: { value: 'me@opbaj.tp' },
          },
          {
            'First Name': { value: 'Christian' },
            'Last Name': { value: 'Ramos' },
            Email: { value: 'uw@ag.tg' },
          },
          {
            'First Name': { value: 'Frederick' },
            'Last Name': { value: 'Boyd' },
            Email: { value: 'kempur@ascebec.gs' },
          },
        ],
      },
    })
  })
  it('has headers', () => {
    const headers = parseBuffer(buffer).Sheet1.headers
    expect(headers).toEqual(['First Name', 'Last Name', 'Email'])
  })
})
