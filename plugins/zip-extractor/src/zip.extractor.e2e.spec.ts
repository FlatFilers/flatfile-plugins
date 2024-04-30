import { FlatfileClient } from '@flatfile/api'
import {
  deleteSpace,
  getEnvironmentId,
  getFiles,
  setupListener,
  setupSpace,
} from '@flatfile/utils-testing'
import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'
import { ZipExtractor } from '.'

const api = new FlatfileClient()

describe.skip('ZipExtractor e2e', () => {
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

  it('extracts the files in test-basic.zip and uploads them to the space', async () => {
    mock('fs')
    await listener.waitFor('file:created', 4)
    const filesPostUpload = await getFiles(spaceId)
    expect(filesPostUpload.length).toBe(4)
  })
})
