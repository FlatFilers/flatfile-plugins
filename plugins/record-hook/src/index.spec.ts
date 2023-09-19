import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '.'

describe('recordHook', () => {
  test('it registers a records:* listener to the client', () => {
    const testListener = FlatfileListener.create((listener) => {})
    const listenerOnSpy = jest.spyOn(testListener, 'on')
    const testCallback = (record: FlatfileRecord) => {
      return record
    }
    testListener.use(recordHook('my-sheet-slug', testCallback))
    expect(listenerOnSpy).toHaveBeenCalled()
  })
})
