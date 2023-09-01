import api from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { webhookEgress } from './webhook.egress'
import { FlatfileEvent } from '@flatfile/listener'

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
    const operationSuccess = 'egressTestSuccess'
    const webhookUrl =
      'https://webhook.site/4eb39ab6-87d7-4087-8a49-08dcb547252b'
    listener.use(webhookEgress(operationSuccess, webhookUrl))

    const { data: successfulJob } = await api.jobs.create({
      type: 'workbook',
      operation: operationSuccess,
      source: workbookId,
    })
    const successfulJobId = successfulJob.id
    await api.jobs.execute(successfulJobId)

    await listener.waitFor('job:ready', 1, `workbook:${operationSuccess}`)

    const response = await api.jobs.get(successfulJobId)
    expect(response.data.outcome.message).toEqual(
      `Data was successfully submitted to the provided webhook. Go check it out at ${webhookUrl}.`
    )
  })

  it('returns failure outcome message', async () => {
    const logErrorSpy = jest.spyOn(global.console, 'error')

    const operationFailure = 'egressTestFailure'
    const invalidWebhookUrl = 'https://webhook.site'
    listener.use(webhookEgress(operationFailure, invalidWebhookUrl))

    const { data: failedJob } = await api.jobs.create({
      type: 'workbook',
      operation: operationFailure,
      source: workbookId,
    })
    const failedJobId = failedJob.id
    await api.jobs.execute(failedJobId)

    await listener.waitFor('job:ready', 1, `workbook:${operationFailure}`)

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
