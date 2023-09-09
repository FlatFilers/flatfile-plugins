import api from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import {
  createRecords,
  deleteSpace,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { webhookEgress } from './webhook.egress'

jest.setTimeout(10_000)

describe('webhookEgress() e2e', () => {
  const listener = setupListener()

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
    const webhookUrl =
      'https://webhook.site/077ab8ee-8570-48b0-82d7-f7561ae75dc2'
    listener.use(webhookEgress('workbook:egressTestSuccess', webhookUrl))

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
      `Data was successfully submitted to the provided webhook. Go check it out at ${webhookUrl}.`
    )
  })

  it('returns failure outcome message', async () => {
    const logErrorSpy = jest.spyOn(global.console, 'error')

    const operationFailure = 'egressTestFailure'
    const invalidWebhookUrl = 'https://webhook.site'
    listener.use(webhookEgress('workbook:egressTestFailure', invalidWebhookUrl))

    const { data: failedJob } = await api.jobs.create({
      type: 'workbook',
      operation: 'egressTestFailure',
      source: workbookId,
    })
    const failedJobId = failedJob.id
    await api.jobs.execute(failedJobId)

    await listener.waitFor('job:ready', 1, 'workbook:egressTestFailure')

    expect(logErrorSpy).toHaveBeenCalledWith(
      '[@flatfile/plugin-webhook-egress]:[FATAL] {}'
    )

    const response = await api.jobs.get(failedJobId)
    expect(response.data.outcome).toEqual({
      message:
        "This job failed probably because it couldn't find the webhook URL.",
    })
  })
})
