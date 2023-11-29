import stream from 'stream'

export const ROWS_TO_SEARCH_FOR_HEADER = 10

interface DefaultOptions {
  algorithm: 'default'
  rowsToSearch?: number
}

interface ExplicitHeadersOptions {
  algorithm: 'explicitHeaders'
  headers: string[]
  skip?: number
}

interface SpecificRowsOptions {
  algorithm: 'specificRows'
  rowNumbers: number[]
  skip?: number
}

interface NewfangledOptions {
  algorithm: 'newfangled'
}

export type GetHeadersOptions =
  | DefaultOptions
  | ExplicitHeadersOptions
  | SpecificRowsOptions
  | NewfangledOptions

interface GetHeadersResult {
  header: string[]
  skip: number
}

// Takes a datastream (representing a CSV) and returns the header row and the number of rows to skip
export abstract class Headerizer {
  constructor() {}
  abstract getHeaders(dataStream: stream.Readable): Promise<GetHeadersResult>

  static create(options: GetHeadersOptions): Headerizer {
    switch (options.algorithm) {
      case 'explicitHeaders':
        return new ExplicitHeaders(options)
      case 'specificRows':
        return new SpecificRows(options)
      case 'newfangled':
        throw new Error('Not implemented')
      default:
        return new OriginalDetector(options)
    }
  }
}

export const countNonEmptyCells = (row: string[]): number => {
  return row.filter((cell) => cell.trim() !== '').length
}

// This is the original / default implementation of detectHeader.
// It looks at the first `rowsToSearch` rows and takes the row
// with the most non-empty cells as the header, preferring the earliest
// such row in the case of a tie.
class OriginalDetector extends Headerizer {
  private rowsToSearch: number

  constructor(private options: DefaultOptions) {
    super()
    this.rowsToSearch = options.rowsToSearch || ROWS_TO_SEARCH_FOR_HEADER
  }

  async getHeaders(dataStream: stream.Readable): Promise<GetHeadersResult> {
    let currentRow = 0
    let skip = 0
    let header: string[] = []

    // This is the original implementation of detectHeader
    const detector = new stream.Writable({
      objectMode: true,
      write: (row, encoding, callback) => {
        currentRow++
        if (currentRow >= this.rowsToSearch) {
          dataStream.destroy()
        }
        if (countNonEmptyCells(row) > countNonEmptyCells(header)) {
          header = row
          skip = currentRow
        }
        callback()
      },
    })

    dataStream.pipe(detector, { end: true })

    return new Promise((resolve, reject) => {
      detector.on('finish', () => {
        resolve({ header, skip })
      })
      dataStream.on('close', () => {
        resolve({ header, skip })
      })
      dataStream.on('error', (error) => {
        reject(error)
      })
    })
  }
}

// This implementation simply returns an explicit list of headers
// it was provided with.
class ExplicitHeaders extends Headerizer {
  headers: string[]
  constructor(private readonly options: ExplicitHeadersOptions) {
    super()

    if (!options.headers || options.headers.length === 0) {
      throw new Error('ExplicitHeaders requires at least one header')
    }
  }

  async getHeaders(dataStream: stream.Readable): Promise<GetHeadersResult> {
    return {
      header: this.options.headers,
      skip: this.options.skip || 0,
    }
  }
}

// This implementation looks at specific rows and combines them into a single header.
// For example, if you knew that the header was in the third row, you could pass it
// { rowNumbers: [2] }
class SpecificRows extends Headerizer {
  constructor(private readonly options: SpecificRowsOptions) {
    super()

    if (!options.rowNumbers || options.rowNumbers.length === 0) {
      throw new Error('SpecificRows requires at least one row number')
    }
  }

  async getHeaders(dataStream: stream.Readable): Promise<GetHeadersResult> {
    let currentRow = 0
    let maxRow = Math.max(...this.options.rowNumbers)
    let header: string[] = []

    const detector = new stream.Writable({
      objectMode: true,
      write: (row, encoding, callback) => {
        if (currentRow > maxRow) {
          dataStream.destroy()
        } else if (this.options.rowNumbers.includes(currentRow)) {
          if (header.length === 0) {
            // This is the first header row we've seen, so just remember it
            header = row
          } else {
            for (let i = 0; i < header.length; i++) {
              if (header[i] === '') {
                header[i] = row[i].trim()
              } else {
                header[i] = `${header[i].trim()} ${row[i].trim()}`
              }
            }
          }
        }
        currentRow++
        callback()
      },
    })

    dataStream.pipe(detector, { end: true })

    // If we have an explicit skip, use it, otherwise skip past the last header row
    const skip = this.options.skip ?? maxRow + 1

    // TODO: this logic is duplicated, factor it out?
    return new Promise((resolve, reject) => {
      detector.on('finish', () => {
        resolve({ header, skip })
      })
      dataStream.on('close', () => {
        resolve({ header, skip })
      })
      dataStream.on('error', (error) => {
        reject(error)
      })
    })
  }
}
