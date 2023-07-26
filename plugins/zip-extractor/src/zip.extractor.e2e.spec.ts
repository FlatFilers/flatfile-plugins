import api, { Flatfile } from '@flatfile/api'
import * as fs from 'fs'
import * as path from 'path'
import {
  deleteSpace,
  getEnvironmentId,
  getFiles,
  setupSpace,
} from '../../../testing/test.helpers'
import { ZipExtractor } from './zip.extractor'

describe('ZipExtractor e2e', () => {
  let spaceId
  let extractor: ZipExtractor

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id

    const stream = fs.createReadStream(
      path.join(__dirname, '../ref/getting-started-flat.zip')
    )
    const fileResponse = await api.files.upload(stream, {
      spaceId,
      environmentId: getEnvironmentId(),
    })
    const fileId = fileResponse.data.id
    extractor = new ZipExtractor({
      topic: Flatfile.EventTopic.FileCreated,
      payload: {},
      createdAt: new Date(),
      context: {
        fileId,
        spaceId,
        environmentId: getEnvironmentId(),
      },
    })
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('test-basic.zip', () => {
    jest.mock('fs')
    test('files extracted and uploaded to space', async () => {
      const files = await getFiles(spaceId)
      expect(files.length).toBe(1)
      await extractor.runExtraction()
      const filesPostUpload = await getFiles(spaceId)
      expect(filesPostUpload.length).toBe(4)
    })
  })
})
