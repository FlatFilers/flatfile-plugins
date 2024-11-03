import * as fs from 'fs'
import * as path from 'path'
import { parseBuffer } from './parser'

describe('parser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-multisheet.json')
  )

  const CONTACT_HEADERS = [
    'First Name',
    'Last Name',
    'Email',
    'Address.Street',
    'Address.City',
    'Address.State',
    'Address.Zip',
    'Address.Coordinates.Latitude',
    'Address.Coordinates.Longitude'
  ];

  const ORDER_HEADERS = [
    'ID',
    'Amount',
  ]

  test('JSON to WorkbookCapture', () => {
    const capture = parseBuffer(buffer)
    expect(capture).toEqual({
      contacts: {
        headers: CONTACT_HEADERS,
        data: [
          {
            'First Name': { value: 'Tony' },
            'Last Name': { value: 'Lamb' },
            Email: { value: 'me@opbaj.tp' },
            'Address.Street': { value: '123 Main Street' },
            'Address.City': { value: 'Springfield' },
            'Address.State': { value: 'ST' },
            'Address.Zip': { value: '12345' },
            'Address.Coordinates.Latitude': { value: '40.7128° N' },
            'Address.Coordinates.Longitude': { value: '74.0060° W' },
          },
          {
            'First Name': { value: 'Christian' },
            'Last Name': { value: 'Ramos' },
            Email: { value: 'uw@ag.tg' },
            'Address.Street': { value: '456 Elm Street' },
            'Address.City': { value: 'Greenville' },
            'Address.State': { value: 'GT' },
            'Address.Zip': { value: '67890' },
            'Address.Coordinates.Latitude': { value: '40.7128° N' },
            'Address.Coordinates.Longitude': { value: '74.0060° W' },
          },
          {
            'First Name': { value: 'Frederick' },
            'Last Name': { value: 'Boyd' },
            Email: { value: 'kempur@ascebec.gs' },
            'Address.Street': { value: '789 Oak Street' },
            'Address.City': { value: 'Rivertown' },
            'Address.State': { value: 'RT' },
            'Address.Zip': { value: '10112' },
            'Address.Coordinates.Latitude': { value: '40.7128° N' },
            'Address.Coordinates.Longitude': { value: '74.0060° W' },
          },
        ],
        metadata: undefined,
      },
      orders: {
        headers: ORDER_HEADERS,
        data: [
          {
            ID: { value: "1234" },
            Amount: { value: 5678 }
          },
          {
            ID: { value: "9876" },
            Amount: { value: 5432 }
          }
        ],
        metadata: undefined,
      },
    })
  })
  it('has contact headers', () => {
    const headers = parseBuffer(buffer).contacts.headers
    expect(headers).toEqual(CONTACT_HEADERS)
  })
  it('has order headers', () => {
    const headers = parseBuffer(buffer).orders.headers
    expect(headers).toEqual(ORDER_HEADERS)
  })
})
