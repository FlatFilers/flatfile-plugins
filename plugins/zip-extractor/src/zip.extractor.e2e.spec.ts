import { FlatfileClient } from '@flatfile/api'
import {
  deleteSpace,
  getEnvironmentId,
  getFiles,
  setupDriver,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import * as fs from 'fs'
import * as path from 'path'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'
import { ZipExtractor } from '.'

const api = new FlatfileClient()

describe('ZipExtractor e2e', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)
  })

  afterAll(() => {
    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })

  let spaceId

  beforeAll(async () => {
    const environmentId = getEnvironmentId()!
    const space = await setupSpace()
    spaceId = space.id

    listener.use(ZipExtractor())

    const stream = fs.createReadStream(
      path.join(__dirname, '../ref/getting-started-flat.zip')
    )
    await api.files.upload(stream, {
      spaceId,
      environmentId,
    })
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('test-basic.zip', () => {
    test('files extracted and uploaded to space', async () => {
      await listener.waitFor('file:created', 4)
      const filesPostUpload = await getFiles(spaceId)
      expect(filesPostUpload.length).toBe(4)
    })
  })
})
