import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it, test } from 'vitest'
import { parseBuffer } from './parser'

describe('parser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-basic.json')
  )

  test('JSON to WorkbookCapture', () => {
    const capture = parseBuffer(buffer)
    expect(capture).toEqual({
      Sheet1: {
        headers: [
          'First Name',
          'Last Name',
          'Email',
          'Address.Street',
          'Address.City',
          'Address.State',
          'Address.Zip',
          'Address.Coordinates.Latitude',
          'Address.Coordinates.Longitude',
          'Father.First Name',
          'Father.Last Name',
          'Father.Father.First Name',
          'Father.Father.Last Name',
          'Father.Father.Father.First Name',
          'Father.Father.Father.Last Name',
          'Father.Father.Father.Father.First Name',
          'Father.Father.Father.Father.Last Name',
          'Father.Father.Father.Father.Father.First Name',
          'Father.Father.Father.Father.Father.Last Name',
        ],
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
            'Father.First Name': { value: 'Father_First_1' },
            'Father.Last Name': { value: 'Father_Last_1' },
            'Father.Father.First Name': { value: 'Father_First_2' },
            'Father.Father.Last Name': { value: 'Father_Last_2' },
            'Father.Father.Father.First Name': { value: 'Father_First_3' },
            'Father.Father.Father.Last Name': { value: 'Father_Last_3' },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': { value: 'Father_Last_4' },
            'Father.Father.Father.Father.Father.First Name': {
              value: 'Father_First_5',
            },
            'Father.Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_5',
            },
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
            'Father.First Name': { value: 'Father_First_1' },
            'Father.Last Name': { value: 'Father_Last_1' },
            'Father.Father.First Name': { value: 'Father_First_2' },
            'Father.Father.Last Name': { value: 'Father_Last_2' },
            'Father.Father.Father.First Name': { value: 'Father_First_3' },
            'Father.Father.Father.Last Name': { value: 'Father_Last_3' },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': { value: 'Father_Last_4' },
            'Father.Father.Father.Father.Father.First Name': {
              value: 'Father_First_5',
            },
            'Father.Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_5',
            },
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
            'Father.First Name': { value: 'Father_First_1' },
            'Father.Last Name': { value: 'Father_Last_1' },
            'Father.Father.First Name': { value: 'Father_First_2' },
            'Father.Father.Last Name': { value: 'Father_Last_2' },
            'Father.Father.Father.First Name': { value: 'Father_First_3' },
            'Father.Father.Father.Last Name': { value: 'Father_Last_3' },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': { value: 'Father_Last_4' },
            'Father.Father.Father.Father.Father.First Name': {
              value: 'Father_First_5',
            },
            'Father.Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_5',
            },
          },
        ],
        metadata: undefined,
      },
    })
  })
  it('has headers', () => {
    const headers = parseBuffer(buffer).Sheet1.headers
    expect(headers).toEqual([
      'First Name',
      'Last Name',
      'Email',
      'Address.Street',
      'Address.City',
      'Address.State',
      'Address.Zip',
      'Address.Coordinates.Latitude',
      'Address.Coordinates.Longitude',
      'Father.First Name',
      'Father.Last Name',
      'Father.Father.First Name',
      'Father.Father.Last Name',
      'Father.Father.Father.First Name',
      'Father.Father.Father.Last Name',
      'Father.Father.Father.Father.First Name',
      'Father.Father.Father.Father.Last Name',
      'Father.Father.Father.Father.Father.First Name',
      'Father.Father.Father.Father.Father.Last Name',
    ])
  })
})
