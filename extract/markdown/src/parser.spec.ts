import * as fs from 'fs'
import * as path from 'path'
import { ExtractMarkdownOptions } from './index'
import { parseBuffer } from './parser'

describe('Markdown Extractor Parser', () => {
  const testCases = [
    { file: 'simple_table.md', expectedTables: 1 },
    { file: 'multiple_tables.md', expectedTables: 3 },
    { file: 'complex_table.md', expectedTables: 1 },
  ]

  testCases.forEach(({ file, expectedTables }) => {
    test(`should correctly parse ${file}`, () => {
      const filePath = path.join(__dirname, '..', 'samples', file)
      const buffer = fs.readFileSync(filePath)
      const options: ExtractMarkdownOptions = {
        maxTables: Infinity,
      }

      const result = parseBuffer(buffer, options)

      expect(Object.keys(result).length).toBe(expectedTables)

      // Additional checks for each table
      Object.values(result).forEach((table) => {
        expect(table.headers).toBeDefined()
        expect(table.headers.length).toBeGreaterThan(0)
        expect(table.data).toBeDefined()
        expect(table.data.length).toBeGreaterThan(0)
      })
    })
  })

  test('should respect maxTables option', () => {
    const filePath = path.join(__dirname, '..', 'samples', 'multiple_tables.md')
    const buffer = fs.readFileSync(filePath)
    const options: ExtractMarkdownOptions = {
      maxTables: 2,
    }

    const result = parseBuffer(buffer, options)

    expect(Object.keys(result).length).toBe(2)
  })

  test('should handle errorHandling option', () => {
    const filePath = path.join(__dirname, '..', 'samples', 'lenient_tables.md')
    const buffer = fs.readFileSync(filePath)

    const strictOptions: ExtractMarkdownOptions = { errorHandling: 'strict' }
    expect(() => parseBuffer(buffer, strictOptions)).toThrow()

    const lenientOptions: ExtractMarkdownOptions = {
      errorHandling: 'lenient',
    }
    expect(() => parseBuffer(buffer, lenientOptions)).not.toThrow()
  })
})
