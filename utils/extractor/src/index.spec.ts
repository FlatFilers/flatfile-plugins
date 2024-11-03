import * as fs from 'fs'
import * as path from 'path'
import { parseSheet } from './index'

describe('parser', function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, '../ref/test-array-to-sheetcapture.json')
  )
  const jsonObj = JSON.parse(buffer.toString('utf8'));

  test('JSON to SheetCapture', () => {
    const capture = parseSheet(jsonObj)
    expect(capture).toEqual({
      headers: [
        'First Name',
        'Last Name',
        'Nicknames.0',
        'Nicknames.1',
        'Age',
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
        'Father.Father.Father.Last Name'
      ],
      data: [
        {
          'First Name': { value: 'Tony' },
          'Last Name': { value: 'Lamb' },
          "Nicknames.0": { "value": "Dr. T" },
          "Nicknames.1": { "value": "Señior Lamb" },
          "Age": { "value": 33 },
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
        },
        {
          'First Name': { value: 'Christian' },
          'Last Name': { value: 'Ramos' },
          "Nicknames.0": { "value": undefined },
          "Nicknames.1": { "value": undefined },
          "Age": { "value": 37 },
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
        },
        {
          'First Name': { value: 'Frederick' },
          'Last Name': { value: 'Boyd' },
          "Nicknames.0": { "value": undefined },
          "Nicknames.1": { "value": undefined },
          "Age": { "value": undefined },
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
        },
      ],
      metadata: undefined,
    })
  })
})
