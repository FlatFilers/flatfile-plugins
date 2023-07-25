import api, { Flatfile } from '@flatfile/api'
import { AbstractExtractor } from './abstract.extractor'
import { getEnvironmentId, setupSpace } from '../../../testing/test.helpers'
import fs from 'fs'
import path from 'path'

describe('AbstractExtractor', function () {
  let parser: AbstractExtractor
  let fileId: string

  beforeAll(async () => {
    const space = await setupSpace()
    const spaceId = space.id

    const stream = fs.createReadStream(path.join(__dirname, '../ref/test.csv'))

    const fileResponse = await api.files.upload(stream, {
      spaceId,
      environmentId: getEnvironmentId(),
    })
    fileId = fileResponse.data.id
    parser = new AbstractExtractor({
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

  test('constructor setup', () => {
    expect(parser.fileId).toBe(fileId)
    expect(parser.api).toBeDefined()
  })

  test('job start/complete', async () => {
    const job = await parser.startJob('test')
    expect(job.id).toBeDefined()
    expect(job.status).toBe('created')
    const res = await parser.completeJob(job)
    expect(res.data.info).toBe('Extraction complete')
  })

  test('workbook creation', async () => {
    const job = await parser.startJob('test')
    const workbook = await parser.createWorkbook(
      job,
      { id: fileId, name: 'test.csv' },
      {}
    )
    expect(workbook).toBeDefined()
    expect(workbook.sheets).toBeDefined()
    expect(workbook.sheets.length).toBe(0)
    await parser.completeJob(job)
  })
})
