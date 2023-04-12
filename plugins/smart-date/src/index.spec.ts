import { smartDate } from '.'

describe('smartDate', () => {
  test('it logs "smart date"', () => {
    const logSpy = jest.spyOn(console, 'log')
    smartDate()
    expect(logSpy).toHaveBeenCalledWith('smart date')
  })
})
