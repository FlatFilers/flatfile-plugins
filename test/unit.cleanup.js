const getHeapSpaceStatistics = require('v8')

afterAll(() => {
  // cleanup mocks and modules and allow the GC to do its thing:
  jest.resetModules()
  jest.clearAllMocks()
  jest.clearAllTimers()
  if (process.env['PRINT_V8_STATS'] === 'true') {
    console.log(`${JSON.stringify(getHeapSpaceStatistics(), null, 4)}`)
  }
})
