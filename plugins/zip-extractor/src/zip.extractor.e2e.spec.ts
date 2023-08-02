import api from '@flatfile/api'
import * as fs from 'fs'
import * as path from 'path'
import {
  deleteSpace,
  getEnvironmentId,
  getFiles,
  setupListener,
  setupSpace,
} from '../../../testing/test.helpers'
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
      await listener.waitFor('file:created')
      const filesPostUpload = await getFiles(spaceId)
      expect(filesPostUpload.length).toBe(4)
    })
  })
})
