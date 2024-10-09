import type { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import type { MarkdownExtractorOptions } from '.'

export function parseBuffer(
  buffer: Buffer,
  options: MarkdownExtractorOptions
): WorkbookCapture {
  const content = buffer.toString('utf-8')
  const tables = extractTablesFromMarkdown(content, options)

  const sheets: Record<string, SheetCapture> = {}

  tables.forEach((table, index) => {
    const sheetName = `Table_${index + 1}`
    sheets[sheetName] = {
      headers: table.headers,
      data: table.rows.map((row) => {
        const record: Record<string, { value: string }> = {}
        row.forEach((cell, cellIndex) => {
          record[table.headers[cellIndex]] = { value: cell }
        })
        return record
      }),
    }
  })

  return sheets
}

export function extractTablesFromMarkdown(
  content: string,
  options: MarkdownExtractorOptions
): Array<{ headers: string[]; rows: string[][] }> {
  const tables: Array<{ headers: string[]; rows: string[][] }> = []
  // More flexible regex pattern
  const tableRegex =
    /\|(.+?)\|[\r\n]+\|(?:[-:]+\|)+[\r\n]+((?:\|.+?\|[\r\n]+)+)/g
  let match

  if (options.debug) {
    console.log('Content to parse:', content)
  }

  while ((match = tableRegex.exec(content)) !== null) {
    if (options.maxTables && tables.length >= options.maxTables) {
      if (options.debug) {
        console.log(
          `Max tables (${options.maxTables}) reached. Stopping extraction.`
        )
      }
      break
    }

    try {
      if (options.debug) {
        console.log('Found potential table:', match[0])
      }

      const headerRow = match[1]
        .split('|')
        .map((h) => h.trim())
        .filter(Boolean)

      if (headerRow.length === 0) {
        throw new Error('No headers found in table')
      }

      const dataRowsText = match[2]
      const dataRows = dataRowsText
        .split('\n')
        .map((row) =>
          row
            .split('|')
            .map((cell) => cell.trim())
            .filter(Boolean)
        )
        .filter((row) => row.length > 0) // Filter out empty rows

      if (options.debug) {
        console.log('Parsed headers:', headerRow)
        console.log('Parsed data rows:', dataRows)
      }

      // Attempt to reconcile mismatched column counts
      const maxColumns = Math.max(
        headerRow.length,
        ...dataRows.map((row) => row.length)
      )
      const normalizedDataRows = dataRows.map((row) => {
        if (
          options.errorHandling === 'strict' &&
          row.length !== headerRow.length
        ) {
          throw new Error('Data row length does not match header row length')
        }

        while (row.length < maxColumns) {
          row.push('') // Pad with empty cells
        }
        return row.slice(0, maxColumns) // Trim excess cells
      })

      if (options.debug) {
        console.log('Normalized data rows:', normalizedDataRows)
      }

      tables.push({
        headers: headerRow,
        rows: normalizedDataRows,
      })

      if (options.debug) {
        console.log(
          'Successfully added table. Current table count:',
          tables.length
        )
      }
    } catch (error) {
      if (options.errorHandling === 'strict') {
        throw error
      } else {
        console.warn('Error parsing table:', error.message)
      }
    }
  }

  if (options.debug) {
    console.log(`Extraction complete. Found ${tables.length} tables.`)
  }

  return tables
}
