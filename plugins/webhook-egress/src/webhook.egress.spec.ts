import api from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import axios from 'axios'
import { webhookEgress } from './webhook.egress'

jest.setTimeout(10_000)
jest.mock('axios')

describe('webhookEgress() e2e', () => {
  const listener = setupListener()
  const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>

  let spaceId
  let workbookId
  let sheetId

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      'name',
      'email',
      'notes',
    ])
    workbookId = workbook.id
    sheetId = workbook.sheets[0].id
    await createRecords(sheetId, [
      {
        name: 'John Doe',
        email: 'john@doe.com',
        notes: 'foobar',
      },
      {
        name: 'Jane Doe',
        email: 'jane@doe.com',
        notes: 'foobar',
      },
    ])
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('returns successful outcome message', async () => {
    mockedAxiosPost.mockResolvedValue({
      status: 200,
      data: {},
    })
    listener.use(webhookEgress('workbook:egressTestSuccess', 'example.com'))

    const { data: successfulJob } = await api.jobs.create({
      type: 'workbook',
      operation: 'egressTestSuccess',
      source: workbookId,
    })
    const successfulJobId = successfulJob.id
    await api.jobs.execute(successfulJobId)

    await listener.waitFor('job:ready', 1, 'workbook:egressTestSuccess')

    const response = await api.jobs.get(successfulJobId)
    expect(response.data.outcome.message).toEqual(
      `Data was successfully submitted to the provided webhook. Go check it out at example.com.`
    )
  })

  it('returns failure outcome message', async () => {
    mockedAxiosPost.mockResolvedValue({
      status: 400,
      statusText: 'Bad Request',
      data: {},
    })

    const logErrorSpy = jest.spyOn(global.console, 'error')

    listener.use(webhookEgress('workbook:egressTestFailure', 'example.com'))

    const { data: failedJob } = await api.jobs.create({
      type: 'workbook',
      operation: 'egressTestFailure',
      source: workbookId,
    })
    const failedJobId = failedJob.id
    await api.jobs.execute(failedJobId)

    await listener.waitFor('job:ready', 1, 'workbook:egressTestFailure')

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[@flatfile/plugin-webhook-egress]:[FATAL] Failed to submit data to example.com. Status: 400 Bad Request'
      )
    )

    const response = await api.jobs.get(failedJobId)
    expect(response.data.outcome).toEqual({
      message:
        'Data was not successfully submitted to the provided webhook. Status: 400 Bad Request',
    })
  })
})
