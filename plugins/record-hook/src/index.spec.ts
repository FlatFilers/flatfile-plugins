import { recordHook } from '.'
import { Client } from '@flatfile/listener'
import { FlatfileRecord } from '@flatfile/hooks'

describe('recordHook', () => {
  test('it registers a records:* listener to the client', () => {
    const testClient = Client.create((client) => {})
    const clientOnSpy = jest.spyOn(testClient, 'on')
    const testCallback = (record: FlatfileRecord) => {
      return record
    }
    testClient.use(recordHook('my-sheet-slug', testCallback))
    expect(clientOnSpy).toHaveBeenCalled()
  })
})
