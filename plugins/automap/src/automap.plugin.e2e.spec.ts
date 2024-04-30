import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  getEnvironmentId,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test'
import fs from 'fs'
import path from 'path'
import { automap } from './automap.plugin'

const api = new FlatfileClient()

describe.skip('automap() e2e', () => {
  const listener = setupListener()

  let spaceId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    await setupSimpleWorkbook(spaceId, ['name', 'email', 'notes'])
  })

  afterAll(async () => {
    await api.spaces.delete(spaceId)
  })

  describe('record created - static sheet slug', () => {
    const mockFn = mock()

    beforeEach(async () => {
      const stream = fs.createReadStream(path.join(__dirname, '../test.csv'))

      await api.files.upload(stream, {
        spaceId,
        environmentId: getEnvironmentId(),
      })

      listener.use(
        automap({
          accuracy: 'confident',
          matchFilename: /test.csv$/g,
          defaultTargetSheet: 'test',
        })
      )

      listener.on(
        Flatfile.EventTopic.JobCompleted,
        { job: 'workbook:map' },
        (event) => {
          mockFn(event.context.jobId)
        }
      )
    })

    it('correctly modifies a value', async () => {
      await listener.waitFor(
        Flatfile.EventTopic.JobCompleted,
        1,
        'workbook:map'
      )

      expect(mockFn).toHaveBeenCalled()
    }, 90_000)
  })

  describe('record created - dynamic sheet slug', () => {
    const mockFn = mock()

    beforeEach(async () => {
      const stream = fs.createReadStream(path.join(__dirname, '../test.csv'))

      await api.files.upload(stream, {
        spaceId,
        environmentId: getEnvironmentId(),
      })

      listener.use(
        automap({
          accuracy: 'confident',
          matchFilename: /test.csv$/g,
          defaultTargetSheet: (fileName: string) => {
            if (fileName.match(/test.csv$/g)) {
              return 'test'
            }
            return 'contacts'
          },
        })
      )

      listener.on(
        Flatfile.EventTopic.JobCompleted,
        { job: 'workbook:map' },
        (event) => {
          mockFn(event.context.jobId)
        }
      )
    })

    it('correctly modifies a value', async () => {
      await listener.waitFor(
        Flatfile.EventTopic.JobCompleted,
        1,
        'workbook:map'
      )

      expect(mockFn).toHaveBeenCalled()
    }, 90_000)
  })
})
