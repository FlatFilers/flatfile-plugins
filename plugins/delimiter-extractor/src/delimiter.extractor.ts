import {
  AbstractExtractor,
  SheetCapture,
  WorkbookCapture,
} from '@flatfile/plugin-extractor-utils'
import Papa, { ParseResult } from 'papaparse'

export class DelimiterExtractor extends AbstractExtractor {
  private readonly _delimiterMap: Record<string, string> = {
    comma: ',',
    tab: '\t',
    pipe: '|',
    semicolon: ';',
    colin: ':',
    tilde: '~',
    caret: '^',
    hash: '#',
  }

  private readonly _delimiter: string
  private readonly _fileExt: string
  private readonly _options: {
    dynamicTyping?: boolean
    hasHeader?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => any | undefined
  }

  constructor(
    public event: { [key: string]: any },
    public delimiter: string,
    public fileExt: string,
    public options?: {
      dynamicTyping?: boolean
      hasHeader?: boolean
      skipEmptyLines?: boolean | 'greedy'
      transform?: (value: any) => any | undefined
    }
  ) {
    super(event)
    this._delimiter = delimiter
    this._fileExt = fileExt
    this._options = {
      dynamicTyping: false,
      hasHeader: true,
      skipEmptyLines: 'greedy',
      transform: (value) => value || '',
      ...options,
    }
  }

  public parseBuffer(buffer: Buffer): WorkbookCapture {
    try {
      const sheetName = 'Sheet1'

      const fileContents = buffer.toString('utf8')
      if (!fileContents) {
        console.log('Invalid file contents')
        return {
          [sheetName]: {
            headers: [],
            data: {},
          },
        } as WorkbookCapture
      }

      const results: ParseResult<Record<string, string>> = Papa.parse(
        fileContents,
        {
          delimiter: this._delimiterMap[this._delimiter],
          header: this._options.hasHeader,
          skipEmptyLines: this._options.skipEmptyLines,
          transform: this._options.transform,
          dynamicTyping: this._options.dynamicTyping,
        }
      )

      const parsedData = results.data

      if (!parsedData || !parsedData.length) {
        console.log('No data found in the file')
        return {
          [sheetName]: {
            headers: [],
            data: {},
          },
        } as WorkbookCapture
      }

      const headers = Object.keys(parsedData[0]).filter(
        (header) => header !== ''
      )

      const filteredData = parsedData.map((row: Record<string, any>) => {
        const filteredRow: Record<string, any> = {}
        for (const header of headers) {
          filteredRow[header] = row[header]
        }
        return filteredRow
      })

      return {
        [sheetName]: {
          headers,
          data: filteredData,
        },
      } as WorkbookCapture
    } catch (error) {
      console.log('An error occurred:', error)
      throw error
    }
  }

  convertSheet(sheet: string): SheetCapture | undefined {
    try {
      if (!sheet) {
        console.log('Invalid sheet data')
        return undefined
      }

      const parsedSheet: ParseResult<Record<string, string>> = Papa.parse(
        sheet,
        {
          delimiter: this._delimiterMap[this._delimiter],
          header: this._options.hasHeader,
          skipEmptyLines: this._options.skipEmptyLines,
          transform: this._options.transform,
          dynamicTyping: this._options.dynamicTyping,
        }
      )

      if (!parsedSheet.data || !parsedSheet.data.length) {
        console.log('No data found in the sheet')
        return undefined
      }

      const rows = parsedSheet.data
      const hasHeader = this.isHeaderCandidate(rows[0])

      const colMap: Record<string, string> | null = hasHeader
        ? (rows.shift() as Record<string, string>)
        : null

      if (colMap) {
        const headers = Object.values(colMap)
          .map((val) => val?.replace('*', ''))
          .filter(Boolean)
        const required = Object.fromEntries(
          Object.entries(colMap).map(([key, val]) => [
            headers.find((h) => colMap[h] === val),
            val?.includes('*'),
          ])
        )
        const data = rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, val]) => [
              headers.find((h) => colMap[h] === key) || key,
              val,
            ])
          )
        )

        return {
          headers,
          required,
          data,
        }
      } else {
        return { headers: Object.keys(rows[0]), data: rows }
      }
    } catch (error) {
      console.log('An error occurred:', error)
      throw error
    }
  }

  public async runExtraction(): Promise<boolean> {
    const { data: file } = await this.api.files.get(this.fileId)

    if (file.ext !== this._fileExt) {
      return false
    }
    const job = await this.startJob(`${this._fileExt}-extract`)

    try {
      await this.api.jobs.update(job.id, { status: 'executing' })
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: 'Downloading file',
      })

      const buffer = await this.getFileBufferFromApi(job)

      await this.api.jobs.ack(job.id, { progress: 30, info: 'Parsing Sheets' })

      const capture = this.parseBuffer(buffer)

      if (!capture) {
        return false
      }

      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: 'Creating Workbook',
      })

      const workbook = await this.createWorkbook(job, file, capture)
      if (!workbook?.sheets) {
        await this.failJob(job, 'because no Sheets found.')
        return false
      }

      await this.api.jobs.ack(job.id, {
        progress: 80,
        info: 'Adding records to Sheets',
      })

      for (const sheet of workbook.sheets) {
        if (!capture[sheet.name]) {
          continue
        }
        const recordsData = this.makeAPIRecords(capture[sheet.name])
        await asyncBatch(
          recordsData,
          async (chunk) => {
            await this.api.records.insert(sheet.id, chunk)
          },
          { chunkSize: 10000, parallel: 1 }
        )
      }
      await this.completeJob(job)
      return true
    } catch (e) {
      const message = (await this.api.jobs.get(job.id)).data.info
      await this.failJob(job, 'while ' + message)
      return false
    }
  }

  isHeaderCandidate(header: Record<string, string | number>): boolean {
    if (!header) {
      return false
    }

    return !Object.values(header).some((v) =>
      typeof v === 'string' ? /^\d+$/.test(v) : !!v
    )
  }
}

async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[]) => Promise<R>,
  options: { chunkSize?: number; parallel?: number } = {}
): Promise<R> {
  const { chunkSize, parallel } = { chunkSize: 1000, parallel: 1, ...options }
  const results: R[] = []

  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }

  async function processChunk(chunk: T[]): Promise<void> {
    const result = await callback(chunk)
    results.push(result)
  }

  const promises: Promise<void>[] = []
  let running = 0
  let currentIndex = 0

  function processNext(): void {
    if (currentIndex >= chunks.length) {
      return
    }

    const currentChunk = chunks[currentIndex]
    const promise = processChunk(currentChunk).finally(() => {
      running--
      processNext()
    })

    promises.push(promise)
    currentIndex++
    running++

    if (running < parallel) {
      processNext()
    }
  }

  for (let i = 0; i < parallel && i < chunks.length; i++) {
    processNext()
  }

  await Promise.all(promises)

  return results.flat() as R
}
