type LogType = 'log' | 'warn' | 'error'

export const log = (
  packageName: string,
  msg: string,
  type: LogType = 'log'
): void => {
  const status = {
    log: 'INFO',
    warn: 'WARN',
    error: 'FATAL',
  }
  console[type](`[${packageName}]:[${status[type]}] ${msg}`)
}

export const logInfo = (packageName: string, msg: string): void => {
  log(packageName, msg)
}

export const logWarn = (packageName: string, msg: string): void => {
  log(packageName, msg, 'warn')
}

export const logError = (packageName: string, msg: string): void => {
  log(packageName, msg, 'error')
}
