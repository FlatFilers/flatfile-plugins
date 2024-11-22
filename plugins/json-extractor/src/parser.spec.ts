import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it, test } from 'vitest'
import { parseBuffer, parseSheet } from './parser'

describe('parser', function () {
  describe('parser single sheet', function () {
    const expectedSingleSheetCapture = {
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
            'Father.First Name': {
              value: 'Father_First_1',
            },
            'Father.Last Name': {
              value: 'Father_Last_1',
            },
            'Father.Father.First Name': {
              value: 'Father_First_2',
            },
            'Father.Father.Last Name': {
              value: 'Father_Last_2',
            },
            'Father.Father.Father.First Name': {
              value: 'Father_First_3',
            },
            'Father.Father.Father.Last Name': {
              value: 'Father_Last_3',
            },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_4',
            },
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
            'Father.First Name': {
              value: 'Father_First_1',
            },
            'Father.Last Name': {
              value: 'Father_Last_1',
            },
            'Father.Father.First Name': {
              value: 'Father_First_2',
            },
            'Father.Father.Last Name': {
              value: 'Father_Last_2',
            },
            'Father.Father.Father.First Name': {
              value: 'Father_First_3',
            },
            'Father.Father.Father.Last Name': {
              value: 'Father_Last_3',
            },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_4',
            },
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
            'Father.First Name': {
              value: 'Father_First_1',
            },
            'Father.Last Name': {
              value: 'Father_Last_1',
            },
            'Father.Father.First Name': {
              value: 'Father_First_2',
            },
            'Father.Father.Last Name': {
              value: 'Father_Last_2',
            },
            'Father.Father.Father.First Name': {
              value: 'Father_First_3',
            },
            'Father.Father.Father.Last Name': {
              value: 'Father_Last_3',
            },
            'Father.Father.Father.Father.First Name': {
              value: 'Father_First_4',
            },
            'Father.Father.Father.Father.Last Name': {
              value: 'Father_Last_4',
            },
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
    }

    it('has a single sheet from json input', () => {
      const buffer: Buffer = fs.readFileSync(
        path.join(__dirname, '../ref/test-basic.json')
      )
      const singleSheetCapture = parseBuffer(buffer)

      expect(singleSheetCapture).toEqual(expectedSingleSheetCapture)
    })

    it('has a single sheet from jsonl input', () => {
      const buffer: Buffer = fs.readFileSync(
        path.join(__dirname, '../ref/test-basic.jsonl')
      )
      const singleSheetCapture = parseBuffer(buffer, { fileExt: 'jsonl' })

      expect(singleSheetCapture).toEqual(expectedSingleSheetCapture)
    })

    it('handles empty lines in JSONL', () => {
      const buffer = Buffer.from('{"a": 1}\n\n{"b": 2}')
      const result = parseBuffer(buffer, { fileExt: 'jsonl' })
      expect(result.Sheet1.data).toHaveLength(2)
    })

    it('skips invalid lines in JSONL', () => {
      const buffer = Buffer.from('{"a": 1}\n{invalid}\n{"b": 2}')
      const result = parseBuffer(buffer, { fileExt: 'jsonl' })
      expect(result.Sheet1.data).toHaveLength(2)
    })
  })

  describe('parser multisheet', function () {
    const buffer: Buffer = fs.readFileSync(
      path.join(__dirname, '../ref/test-multisheet.json')
    )
    const multisheetCapture = parseBuffer(buffer)

    it('has multiple sheets', () => {
      expect(multisheetCapture).toEqual({
        contacts: {
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
          headers: ['ID', 'Amount'],
          data: [
            {
              ID: { value: '1234' },
              Amount: { value: 5678 },
            },
            {
              ID: { value: '9876' },
              Amount: { value: 5432 },
            },
          ],
          metadata: undefined,
        },
      })
    })
  })
})
