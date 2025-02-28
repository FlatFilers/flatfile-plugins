import { createXLSXSheetOptions } from './utils'
import { ExportSheetOptions } from './options'
import { JSON2SheetOpts } from 'xlsx'

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
