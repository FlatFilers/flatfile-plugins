import * as util from 'node:util'
import { expect } from 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> {
    toBePending(): T
  }
  interface AsymmetricMatchersContaining {
    toBePending(): void
  }
}

const toBePending = (received: unknown) => {
  const isPending = (promise: Promise<any>) =>
    util.inspect(promise).includes('pending')

  if (!(received instanceof Promise)) {
    throw new TypeError('Actual value is not a promise!')
  }

  const pass = isPending(received)

  return {
    pass,
    message: () =>
      pass
        ? `expected received promise not to be pending`
        : `expected received promise to be pending`,
  }
}

expect.extend({ toBePending })
