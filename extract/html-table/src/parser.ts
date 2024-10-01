import type { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { parse } from 'node-html-parser'

export interface HTMLTableExtractorOptions {
  handleColspan?: boolean
  handleRowspan?: boolean
  maxDepth?: number
  debug?: boolean
}

export function parseBuffer(
  buffer: Buffer,
  options: HTMLTableExtractorOptions
): WorkbookCapture {
  if (options.debug) {
    console.log('Parsing buffer...')
  }

  const content = buffer.toString('utf-8')
  const tables = extractTablesFromHTML(content, options)

  const sheets: Record<string, SheetCapture> = {}

  tables.forEach((table, index) => {
    const sheetName = `Table_${index + 1}`
    sheets[sheetName] = {
      headers: table.headers,
      data: table.rows.map((row) => {
        const record: Record<string, { value: string }> = {}
        row.forEach((cell, cellIndex) => {
          if (cellIndex < table.headers.length) {
            record[table.headers[cellIndex]] = { value: cell }
          } else if (options.debug) {
            console.warn(
              `Row ${index + 1} has more cells than headers. Ignoring extra cell:`,
              cell
            )
          }
        })
        return record
      }),
    }

    if (options.debug) {
      console.log(`Created sheet: ${sheetName}`)
      console.log('Headers:', sheets[sheetName].headers)
      console.log('Row count:', sheets[sheetName].data.length)
    }
  })

  if (options.debug) {
    console.log('Parsing complete. Sheets created:', Object.keys(sheets).length)
  }

  return sheets
}

function extractTablesFromHTML(
  content: string,
  options: HTMLTableExtractorOptions
): Array<{ headers: string[]; rows: string[][] }> {
  const root = parse(content)
  const tables: Array<{ headers: string[]; rows: string[][] }> = []

  if (options.debug) {
    console.log('Content to parse:', content)
  }

  root.querySelectorAll('table').forEach((table, tableIndex) => {
    const headers: string[] = []
    const rows: string[][] = []

    if (options.debug) {
      console.log(`Processing table ${tableIndex + 1}`)
    }

    // Extract headers
    table.querySelectorAll('th').forEach((header) => {
      headers.push(header.text.trim())
    })

    if (options.debug) {
      console.log('Extracted headers:', headers)
    }

    // Extract rows
    table.querySelectorAll('tr').forEach((row, rowIndex) => {
      const rowData: string[] = []

      row.querySelectorAll('td').forEach((cell, cellIndex) => {
        const cellData = cell.text.trim()

        if (options.handleColspan && cell.getAttribute('colspan')) {
          const colspan = parseInt(cell.getAttribute('colspan') || '1', 10)
          for (let i = 0; i < colspan; i++) {
            rowData.push(cellData)
          }
        } else {
          rowData.push(cellData)
        }

        if (options.debug) {
          console.log(`Cell ${cellIndex + 1} in row ${rowIndex + 1}:`, cellData)
        }
      })

      if (rowData.length > 0) {
        rows.push(rowData)
      }
    })

    // Handle rowspan
    if (options.handleRowspan) {
      handleRowspan(rows)
    }

    tables.push({ headers, rows })

    if (options.debug) {
      console.log(`Extracted table ${tableIndex + 1}:`, { headers, rows })
    }
  })

  if (options.debug) {
    console.log(`Extraction complete. Found ${tables.length} tables.`)
  }

  return tables
}

function handleRowspan(rows: string[][]) {
  const rowspanCells: { [key: number]: { value: string; rowspan: number } } = {}

  rows.forEach((row, rowIndex) => {
    Object.keys(rowspanCells).forEach((colIndex) => {
      const colIndexNum = parseInt(colIndex, 10)
      if (rowspanCells[colIndexNum].rowspan > 0) {
        row.splice(colIndexNum, 0, rowspanCells[colIndexNum].value)
        rowspanCells[colIndexNum].rowspan--
      }
    })

    row.forEach((cell, colIndex) => {
      const cellElement = parse(`<td>${cell}</td>`).querySelector('td')
      if (cellElement && cellElement.getAttribute('rowspan')) {
        const rowspan =
          parseInt(cellElement.getAttribute('rowspan') || '1', 10) - 1
        if (rowspan > 0) {
          rowspanCells[colIndex] = { value: cell, rowspan }
        }
      }
    })
  })
}
