import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'

// ---------------------------------------------------------------------------
// Mocks — declared before any imports that trigger plugin.ts resolution
// ---------------------------------------------------------------------------

let mockRecords: any[] = []

vi.mock('@flatfile/util-common', () => ({
  processRecords: vi.fn(async (_sheetId: string, callback: Function) => {
    const result = await callback(mockRecords)
    return [result]
  }),
  logError: vi.fn(),
  logInfo: vi.fn(),
}))

vi.mock('@flatfile/api', async () => {
  const actual = await vi.importActual<any>('@flatfile/api')
  return {
    ...actual,
    FlatfileClient: vi.fn().mockImplementation(() => ({
      workbooks: {
        get: vi.fn().mockResolvedValue({ data: { name: 'Test Workbook' } }),
      },
      sheets: {
        list: vi.fn().mockImplementation(() =>
          Promise.resolve({ data: mockSheets })
        ),
      },
      files: {
        upload: vi.fn().mockResolvedValue({ data: { id: 'us_fl_test' } }),
      },
    })),
  }
})

vi.mock('xlsx', async () => {
  const actualXLSX = await vi.importActual<any>('xlsx')
  return {
    ...actualXLSX,
    default: {
      ...actualXLSX,
      utils: {
        ...actualXLSX.utils,
        json_to_sheet: vi.fn((...args: any[]) => {
          jsonToSheetCalls.push({ rows: args[0], opts: args[1] })
          return actualXLSX.utils.json_to_sheet(...args)
        }),
        book_new: vi.fn(() => ({ SheetNames: ['s'], Sheets: { s: {} } })),
        book_append_sheet: vi.fn(),
      },
      set_fs: vi.fn(),
      writeFile: vi.fn(),
    },
    utils: {
      ...actualXLSX.utils,
      json_to_sheet: vi.fn((...args: any[]) => {
        jsonToSheetCalls.push({ rows: args[0], opts: args[1] })
        return actualXLSX.utils.json_to_sheet(...args)
      }),
      book_new: vi.fn(() => ({ SheetNames: ['s'], Sheets: { s: {} } })),
      book_append_sheet: vi.fn(),
    },
    set_fs: vi.fn(),
    writeFile: vi.fn(),
  }
})

vi.mock('node:fs', () => ({
  default: {
    createReadStream: vi.fn().mockReturnValue({ close: vi.fn() }),
    promises: { unlink: vi.fn().mockResolvedValue(undefined) },
  },
  createReadStream: vi.fn().mockReturnValue({ close: vi.fn() }),
  promises: { unlink: vi.fn().mockResolvedValue(undefined) },
}))

// ---------------------------------------------------------------------------
// Now import the module under test (mocks are already in place)
// ---------------------------------------------------------------------------

import { exportRecords } from './plugin'
import type { PluginOptions } from './options'

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

const jsonToSheetCalls: { rows: any[]; opts?: any }[] = []
const mockSheets: any[] = []

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(): FlatfileEvent {
  return {
    context: {
      environmentId: 'us_env_test',
      spaceId: 'us_sp_test',
      workbookId: 'us_wb_test',
    },
  } as unknown as FlatfileEvent
}

function cell(
  value: any,
  messages: any[] = []
): Flatfile.CellValue {
  return { value, messages, valid: true }
}

function record(
  id: string,
  values: Record<string, Flatfile.CellValue>
): Flatfile.RecordWithLinks {
  return { id, values, valid: true } as Flatfile.RecordWithLinks
}

const tick = vi.fn().mockResolvedValue(undefined)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('exportRecords — column ordering', () => {
  beforeEach(() => {
    jsonToSheetCalls.length = 0
    mockSheets.length = 0
    mockRecords = []
    vi.clearAllMocks()
  })

  it('exports columns in blueprint field order, not API key order', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
          { key: 'C', type: 'string', label: 'C' },
        ],
      },
    })

    // API returns keys in a different order: C, A, B
    mockRecords = [
      record('rec_1', {
        C: cell('c1'),
        A: cell('a1'),
        B: cell('b1'),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    expect(jsonToSheetCalls).toHaveLength(1)
    const { rows, opts } = jsonToSheetCalls[0]

    expect(opts?.header).toEqual(['A', 'B', 'C'])
    expect(Object.keys(rows[0])).toEqual(['A', 'B', 'C'])
  })

  it('applies columnNameTransformer and preserves blueprint order in header', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'first_name', type: 'string', label: 'First Name' },
          { key: 'last_name', type: 'string', label: 'Last Name' },
          { key: 'email', type: 'string', label: 'Email' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        email: cell('bob@test.com'),
        first_name: cell('Bob'),
        last_name: cell('Smith'),
      }),
    ]

    const transformer: PluginOptions['columnNameTransformer'] = async (name) =>
      name.toUpperCase()

    await exportRecords(
      makeEvent(),
      { columnNameTransformer: transformer },
      tick
    )

    const { opts, rows } = jsonToSheetCalls[0]
    expect(opts?.header).toEqual(['FIRST_NAME', 'LAST_NAME', 'EMAIL'])
    expect(Object.keys(rows[0])).toEqual(['FIRST_NAME', 'LAST_NAME', 'EMAIL'])
  })

  it('deduplicates header when transformer produces duplicate names', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'id', type: 'string', label: 'Employee ID' },
          { key: 'name', type: 'string', label: 'Name' },
          { key: 'bank.id', type: 'string', label: 'Employee ID' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        id: cell('EMP_01'),
        name: cell('Bob'),
        'bank.id': cell('BANK_01'),
      }),
    ]

    const labels: Record<string, string> = {
      id: 'Employee ID',
      name: 'Name',
      'bank.id': 'Employee ID',
    }
    const transformer: PluginOptions['columnNameTransformer'] = async (key) =>
      labels[key] ?? key

    await exportRecords(
      makeEvent(),
      { columnNameTransformer: transformer },
      tick
    )

    const { opts } = jsonToSheetCalls[0]
    expect(opts?.header).toEqual(['Employee ID', 'Name'])
  })

  it('appends non-blueprint fields after blueprint columns', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        EXTRA: cell('extra_val'),
        A: cell('a1'),
        B: cell('b1'),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows, opts } = jsonToSheetCalls[0]
    // Note: SheetJS mutates the header array in-place, appending extra keys
    // found in the row objects.  So after the call the header contains all
    // columns.  What matters is that blueprint fields come first.
    expect(opts?.header?.slice(0, 2)).toEqual(['A', 'B'])
    expect(opts?.header).toContain('EXTRA')
    // Row keys: blueprint order first, then extras
    expect(Object.keys(rows[0])).toEqual(['A', 'B', 'EXTRA'])
  })

  it('excludes fields listed in excludeFields from rows and header', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'secret', type: 'string', label: 'Secret' },
          { key: 'B', type: 'string', label: 'B' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1'),
        secret: cell('hidden'),
        B: cell('b1'),
      }),
    ]

    await exportRecords(makeEvent(), { excludeFields: ['secret'] }, tick)

    const { opts, rows } = jsonToSheetCalls[0]
    expect(opts?.header).toEqual(['A', 'B'])
    expect(Object.keys(rows[0])).toEqual(['A', 'B'])
  })

  it('prepends recordId column when includeRecordIds is true', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        B: cell('b1'),
        A: cell('a1'),
      }),
    ]

    await exportRecords(makeEvent(), { includeRecordIds: true }, tick)

    const { opts, rows } = jsonToSheetCalls[0]
    expect(opts?.header).toEqual(['recordId', 'A', 'B'])
    expect(Object.keys(rows[0])).toEqual(['recordId', 'A', 'B'])
    expect(rows[0].recordId).toBe('rec_1')
  })

  it('handles CellValue with missing messages property', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [{ key: 'A', type: 'string', label: 'A' }],
      },
    })

    // CellValue without messages — valid per Flatfile.CellValue type
    mockRecords = [
      record('rec_1', {
        A: { value: 'hello', valid: true } as Flatfile.CellValue,
      }),
    ]

    await expect(exportRecords(makeEvent(), {}, tick)).resolves.not.toThrow()

    const { rows } = jsonToSheetCalls[0]
    expect(rows[0].A.v).toBe('hello')
  })

  it('handles blueprint field absent from record values', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
          { key: 'C', type: 'string', label: 'C' },
        ],
      },
    })

    // B is missing from the record
    mockRecords = [
      record('rec_1', {
        A: cell('a1'),
        C: cell('c1'),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows, opts } = jsonToSheetCalls[0]
    // Header still lists all three
    expect(opts?.header).toEqual(['A', 'B', 'C'])
    // Row only has A and C (B was absent)
    expect(Object.keys(rows[0])).toEqual(['A', 'C'])
  })

  it('handles CellValue with null value', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1'),
        B: cell(null),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(Object.keys(rows[0])).toEqual(['A', 'B'])
    expect(rows[0].B.v).toBeNull()
  })

  it('handles array values (enum-list)', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [{ key: 'tags', type: 'enum-list', label: 'Tags' }],
      },
    })

    mockRecords = [
      record('rec_1', {
        tags: cell(['red', 'blue', 'green']),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(rows[0].tags.v).toBe('red, blue, green')
  })

  it('excludes non-blueprint extra fields that are in excludeFields', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [{ key: 'A', type: 'string', label: 'A' }],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1'),
        EXTRA: cell('should_be_excluded'),
      }),
    ]

    await exportRecords(makeEvent(), { excludeFields: ['EXTRA'] }, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(Object.keys(rows[0])).toEqual(['A'])
  })

  it('empty sheet uses blueprint order for header row', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'X', type: 'string', label: 'X' },
          { key: 'Y', type: 'string', label: 'Y' },
          { key: 'Z', type: 'string', label: 'Z' },
        ],
      },
    })

    // No records at all
    mockRecords = []

    await exportRecords(makeEvent(), {}, tick)

    const { rows, opts } = jsonToSheetCalls[0]
    // Should still produce one row with empty cells in blueprint order
    expect(Object.keys(rows[0])).toEqual(['X', 'Y', 'Z'])
    expect(opts?.header).toEqual(['X', 'Y', 'Z'])
  })

  it('all rows maintain blueprint column order, not just the first', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
          { key: 'C', type: 'string', label: 'C' },
        ],
      },
    })

    // Two records with different API key orders
    mockRecords = [
      record('rec_1', {
        C: cell('c1'),
        A: cell('a1'),
        B: cell('b1'),
      }),
      record('rec_2', {
        B: cell('b2'),
        C: cell('c2'),
        A: cell('a2'),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(Object.keys(rows[0])).toEqual(['A', 'B', 'C'])
    expect(Object.keys(rows[1])).toEqual(['A', 'B', 'C'])
  })

  it('columnNameTransformer returning null falls back to original key', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [
          { key: 'A', type: 'string', label: 'A' },
          { key: 'B', type: 'string', label: 'B' },
        ],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1'),
        B: cell('b1'),
      }),
    ]

    // Transformer returns null for 'A', should fall back to 'A'
    const transformer: PluginOptions['columnNameTransformer'] = async (key) =>
      key === 'A' ? null : 'Bravo'

    await exportRecords(
      makeEvent(),
      { columnNameTransformer: transformer },
      tick
    )

    const { opts } = jsonToSheetCalls[0]
    expect(opts?.header).toEqual(['A', 'Bravo'])
  })

  it('excludeMessages suppresses cell comments', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [{ key: 'A', type: 'string', label: 'A' }],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1', [{ type: 'error', message: 'bad', source: 'custom' }]),
      }),
    ]

    await exportRecords(makeEvent(), { excludeMessages: true }, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(rows[0].A.c).toEqual([])
  })

  it('validation messages are included as cell comments by default', async () => {
    mockSheets.push({
      id: 'us_sh_1',
      name: 'Sheet1',
      config: {
        name: 'Sheet1',
        slug: 'sheet1',
        fields: [{ key: 'A', type: 'string', label: 'A' }],
      },
    })

    mockRecords = [
      record('rec_1', {
        A: cell('a1', [
          { type: 'error', message: 'is required', source: 'custom' },
        ]),
      }),
    ]

    await exportRecords(makeEvent(), {}, tick)

    const { rows } = jsonToSheetCalls[0]
    expect(rows[0].A.c).toHaveLength(1)
    expect(rows[0].A.c[0].t).toBe('[ERROR]: is required')
    expect(rows[0].A.c.hidden).toBe(true)
  })
})
