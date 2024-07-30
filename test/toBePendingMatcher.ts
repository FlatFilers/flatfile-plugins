import type { MatcherFunction } from 'expect'
import * as util from 'node:util'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBePending(): R
    }
    interface Expect {
      toBePending<T>(): JestMatchers<T>
    }
  }
}

const toBePending: MatcherFunction<[recieved: unknown]> = (received) => {
  const isPending = (promise: Promise<any>) =>
    util.inspect(promise).includes('pending')

  if (!(received instanceof Promise)) {
    throw new TypeError('Actual value is not a promise!')
  }

  const pass = isPending(received)

  if (pass) {
    return {
      message: () => `expected recieved promise not to be pending`,
      pass: true,
    }
  } else {
    return {
      message: () => `expected recieved promise to be pending`,
      pass: false,
    }
  }
}

expect.extend({ toBePending })
