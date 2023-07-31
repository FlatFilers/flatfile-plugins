import { shimTarget } from './shim.target' // replace 'your-file' with actual filename

describe('shimTarget()', () => {
  it('returns "space(*)" for a file domain', () => {
    const event = {
      domain: 'file',
      context: {},
      payload: {},
    }
    expect(shimTarget(event)).toBe('space(*)')
  })

  it('returns the action target for a defined action name', () => {
    const event = {
      domain: 'sheet',
      context: {},
      payload: {
        actionName: 'someAction:someDetail',
      },
    }
    expect(shimTarget(event)).toBe('sheet(someAction)')
  })

  it('returns the sheet slug for an undefined action name', () => {
    const event = {
      domain: 'sheet',
      context: {
        sheetSlug: 'someSlug/lastPartOfSlug',
      },
      payload: {},
    }
    expect(shimTarget(event)).toBe('sheet(lastPartOfSlug)')
  })

  it('returns "sheet" domain for a "workbook" domain with defined sheetSlug', () => {
    const event = {
      domain: 'workbook',
      context: {
        sheetSlug: 'someSlug/lastPartOfSlug',
      },
      payload: {},
    }
    expect(shimTarget(event)).toBe('sheet(lastPartOfSlug)')
  })
})
