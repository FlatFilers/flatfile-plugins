import { Flatfile } from '@flatfile/api'
import { WorkbookCapture } from '@flatfile/util-extractor'
import Papa, { ParseResult } from 'papaparse'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import { Delimiters } from '.'
import { GetHeadersOptions, Headerizer } from './header.detection'

export async function parseBuffer(
  buffer: Buffer,
  options: {
    delimiter: Delimiters
    guessDelimiters?: Delimiters[]
    dynamicTyping?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => Flatfile.CellValueUnion
    headerDetectionOptions?: GetHeadersOptions
  }
): Promise<WorkbookCapture> {
  try {
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
        skipEmptyLines: options?.skipEmptyLines || 'greedy',
      }
    )

    const rows = results.data
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
    const { header, skip } = await headerizer.getHeaders(headerStream)

    rows.splice(0, skip)
    // return if there are no rows
    if (rows.length === 0) {
      return
    }

    const headers = prependNonUniqueHeaderColumns(header)
    const required: Record<string, boolean> = {}
    header.forEach((item) => {
      const key = item.replace('*', '').trim()
      const hasAsterisk = item.includes('*')
      required[key] = hasAsterisk
    })

    const data: Flatfile.RecordData[] = rows
      .filter((row) => !Object.values(row).every(isNullOrWhitespace))
      .map((row) => {
        const mappedRow = mapKeys(row, (key) => headers[key])
        return mapValues(mappedRow, (value) => ({
          value: transform(value),
        })) as Flatfile.RecordData
      })

    const sheetName = 'Sheet1'
    return {
      [sheetName]: {
        headers,
        required,
        data,
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
