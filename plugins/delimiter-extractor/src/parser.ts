import { Flatfile } from '@flatfile/api'
import { WorkbookCapture } from '@flatfile/util-extractor'
import Papa, { ParseResult } from 'papaparse'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import { DelimiterOptions } from '../dist/types'
import { Headerizer } from './header.detection'

type ParseBufferOptions = Omit<DelimiterOptions, 'chunkSize' | 'parallel'> & {
  readonly headerSelectionEnabled?: boolean
}

export async function parseBuffer(
  buffer: Buffer,
  options: ParseBufferOptions
): Promise<WorkbookCapture> {
  try {
    const skipEmptyLines = options?.headerSelectionEnabled
      ? false
      : options?.skipEmptyLines === false
        ? false
        : 'greedy'
    const fileContents = buffer.toString('utf8')
    const results: ParseResult<Record<string, string>> = Papa.parse(
      fileContents,
      {
        delimiter: options.delimiter,
        delimitersToGuess: options.guessDelimiters || [
          ',',
          '|',
          '\t',
          ';',
          ':',
          '~',
          '^',
          '#',
        ],
        dynamicTyping: options?.dynamicTyping || false,
        header: false,
        skipEmptyLines,
      }
    )

    let rows = results.data
    if (!rows || !rows.length) {
      console.log('No data found in the file')
      return {} as WorkbookCapture
    }
    const transform = options?.transform || ((value) => value)

    const extractValues = (data: Record<string, any>[]) =>
      data.map((row) => Object.values(row).filter((value) => value !== null))
    const headerizer = Headerizer.create(
      options.headerDetectionOptions || {
        algorithm: 'default',
      }
    )
    const headerStream = Readable.from(extractValues(rows))
    const { header, skip, letters } = await headerizer.getHeaders(headerStream)

    if (!options?.headerSelectionEnabled) rows.splice(0, skip)

    // return if there are no rows
    if (rows.length === 0) {
      return
    }

    while (
      rows.length > 0 &&
      Object.values(rows[rows.length - 1]).every(isNullOrWhitespace)
    ) {
      rows.pop()
    }

    const columnHeaders = options?.headerSelectionEnabled ? letters : header

    const headers = prependNonUniqueHeaderColumns(columnHeaders)

    const data: Flatfile.RecordData[] = rows.map((row) => {
      const mappedRow = mapKeys(row, (key) => headers[key])
      return mapValues(mappedRow, (value) => ({
        value: transform(value),
      })) as Flatfile.RecordData
    })

    let metadata: { rowHeaders: number[] } | null

    if (options?.headerSelectionEnabled) {
      metadata = {
        rowHeaders: [skip],
      }
    }

    const sheetName = 'Sheet1'
    return {
      [sheetName]: {
        headers,
        data,
        metadata,
      },
    } as WorkbookCapture
  } catch (error) {
    console.log('An error occurred:', error)
    throw error
  }
}

function prependNonUniqueHeaderColumns(record: string[]): string[] {
  const counts: Record<string, number> = {}
  const result: string[] = []
  for (const [key, value] of Object.entries(record)) {
    const cleanValue = value?.toString().replace('*', '')
    if (cleanValue && counts[value]) {
      result[key] = `${cleanValue}_${counts[value]}`
      counts[value]++
    } else {
      result[key] = cleanValue
      counts[value] = 1
    }
  }

  return result
}

const isNullOrWhitespace = (value: any) =>
  value === null || (typeof value === 'string' && value.trim() === '')
