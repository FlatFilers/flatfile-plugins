import api from '@flatfile/api'
import {
  deleteSpace,
  getEnvironmentId,
  getFiles,
  setupListener,
  setupSpace,
} from '@flatfile/utils-testing'
import * as fs from 'fs'
import * as path from 'path'
import { ZipExtractor } from '.'

describe('ZipExtractor e2e', () => {
  const listener = setupListener()

  let spaceId

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id

    listener.use(ZipExtractor())

    const stream = fs.createReadStream(
      path.join(__dirname, '../ref/getting-started-flat.zip')
    )
    await api.files.upload(stream, {
      spaceId,
      environmentId: getEnvironmentId(),
    })
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('test-basic.zip', () => {
    jest.mock('fs')
    test('files extracted and uploaded to space', async () => {
      await listener.waitFor('file:created', 4)
      const filesPostUpload = await getFiles(spaceId)
      expect(filesPostUpload.length).toBe(4)
    })
  })
})
