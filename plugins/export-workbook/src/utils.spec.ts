import { createXLSXSheetOptions } from './utils'
import type { ExportSheetOptions } from './options'
import type { JSON2SheetOpts } from 'xlsx'
import * as XLSX from 'xlsx'

describe('createXLSXSheetOptions', () => {
  it.each([
    [null, {}],
    [undefined, {}],
    [{}, {}],
    [{ skipColumnHeaders: true }, { skipHeader: true }],
    [{ skipColumnHeaders: false }, {}],
    [
      { origin: 123, skipColumnHeaders: true },
      { origin: 123, skipHeader: true },
    ],
    [{ origin: { row: 1, column: 2 } }, { origin: { r: 1, c: 2 } }],
  ])(
    'createXLSXSheetOptions %o',
    (options: ExportSheetOptions, expected: JSON2SheetOpts) => {
      expect(createXLSXSheetOptions(options)).toEqual(expected)
    }
  )
})

describe('XLSX comment shape', () => {
  it('should preserve hidden comments with T flag across write/read cycle', () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([['Test']])

    const comments: any = [
      {
        a: 'Flatfile',
        t: '[INFO]: Test message',
        T: true,
      },
    ]
    comments.hidden = true

    ws['A1'].c = comments

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    const xlsxData = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const readWb = XLSX.read(xlsxData, { type: 'buffer' })
    const readWs = readWb.Sheets['Sheet1']

    expect(readWs['A1'].c).toBeDefined()
    expect(readWs['A1'].c.length).toBeGreaterThan(0)
    expect(readWs['A1'].c.hidden).toBe(true)
  })
})
