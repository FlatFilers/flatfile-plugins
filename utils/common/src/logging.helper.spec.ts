import { log, logError, logInfo, logWarn } from '.'

describe('logging', () => {
  test('log()', () => {
    const logSpy = jest.spyOn(global.console, 'log')
    const logWarnSpy = jest.spyOn(global.console, 'warn')
    const logErrorSpy = jest.spyOn(global.console, 'error')

    log('@flatfile/util-common', 'Log an INFO message')
    expect(logSpy).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[INFO] Log an INFO message'
    )

    log('@flatfile/util-common', 'Log a WARN message', 'warn')
    expect(logWarnSpy).toHaveBeenCalled()
    expect(logWarnSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[WARN] Log a WARN message'
    )

    log('@flatfile/util-common', 'Log a FATAL message', 'error')
    expect(logErrorSpy).toHaveBeenCalled()
    expect(logErrorSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[FATAL] Log a FATAL message'
    )

    logSpy.mockRestore()
    logWarnSpy.mockRestore()
    logErrorSpy.mockRestore()
  })

  test('logInfo()', () => {
    const logSpy = jest.spyOn(global.console, 'log')

    logInfo('@flatfile/util-common', 'Log an INFO message')
    expect(logSpy).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[INFO] Log an INFO message'
    )

    logSpy.mockRestore()
  })

  test('logWarn()', () => {
    const logWarnSpy = jest.spyOn(global.console, 'warn')

    logWarn('@flatfile/util-common', 'Log a WARN message')
    expect(logWarnSpy).toHaveBeenCalled()
    expect(logWarnSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[WARN] Log a WARN message'
    )

    logWarnSpy.mockRestore()
  })

  test('logError()', () => {
    const logErrorSpy = jest.spyOn(global.console, 'error')

    logError('@flatfile/util-common', 'Log a FATAL message')
    expect(logErrorSpy).toHaveBeenCalled()
    expect(logErrorSpy).toHaveBeenCalledWith(
      '[@flatfile/util-common]:[FATAL] Log a FATAL message'
    )

    logErrorSpy.mockRestore()
  })
})
