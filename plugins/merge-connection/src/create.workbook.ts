import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import {
  PartialSheetConfig,
  SetupFactory,
  generateSetup,
} from '@flatfile/plugin-convert-openapi-schema'
import { CATEGORY_MODELS, MERGE_ACCESS_KEY } from './config'
import { getMergeClient, getSecret, handleError } from './utils'

export function handleCreateConnectedWorkbooks() {
  return async (
    event: FlatfileEvent,
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => {
    try {
      const { spaceId, environmentId, jobId } = event.context

      const job = await api.jobs.get(jobId)
      const jobInput = job.data.input
      const publicToken = jobInput?.publicToken
      const apiKey = await getSecret(spaceId, environmentId, MERGE_ACCESS_KEY)

      if (!apiKey) {
        throw new Error('Missing Merge API key')
      }

      const mergeClient = getMergeClient(apiKey)

      let accountTokenObj
      let category

      // Since we don't know what category the Merge integration belongs to, we need to try each one
      const categories = Object.keys(CATEGORY_MODELS)
      for (let categoryAttempt of categories) {
        try {
          accountTokenObj = await mergeClient[
            categoryAttempt as keyof typeof mergeClient
          ].accountToken.retrieve(publicToken)
          if (accountTokenObj) {
            category = categoryAttempt
            break // break out of the loop as soon as a valid category is found
          }
        } catch (e) {} // ignore and keep trying
      }
      if (!category || !accountTokenObj) {
        throw new Error('Error retrieving account token')
      }

      const { accountToken, integration } = accountTokenObj

      await tick(20, 'Retrieved account token...')

      // Using the category, we can fetch Merge's schema provided through their OpenAPI spec and convert it to a Flatfile sheet config
      const models = CATEGORY_MODELS[category]
      const sheets: PartialSheetConfig[] = Object.keys(models).map((key) => {
        const model = models[key]
        return {
          name: key,
          slug: model,
          model: key,
        }
      })

      const setup: SetupFactory = await generateSetup({
        workbooks: [
          {
            source: `https://api.merge.dev/api/${category}/v1/schema`,
            sheets,
          },
        ],
      })
      const config = typeof setup === 'function' ? await setup(event) : setup
      config.workbooks.map((workbook) => {
        workbook.sheets.map((sheet) => {
          sheet.fields.map((field) => {
            delete field.description
          })
        })
      })

      await tick(40, 'Retrieved sheet config...')

      const workbookIds = await Promise.all(
        config.workbooks.map(async (workbookConfig) => {
          const request: Flatfile.CreateWorkbookConfig = {
            spaceId,
            environmentId,
            name: integration.name,
            labels: ['connection'],
            actions: [
              {
                operation: 'syncConnectedWorkbook',
                mode: 'foreground',
                label: 'Sync',
                type: 'string',
                description: `Sync data from ${integration.name}.`,
              },
            ],
            metadata: {
              connections: [
                {
                  source: 'Merge',
                  service: category,
                  lastSyncedAt: new Date().toISOString(), // TODO: is set for UI purposes, but should be updated after sync
                  category,
                },
              ],
            },
            sheets: workbookConfig.sheets,
          }
          console.dir(request, { depth: null })
          const { data: workbook } = await api.workbooks.create(request)
          return workbook.id
        })
      )

      await tick(60, 'Created connected workbook...')

      await api.secrets.upsert({
        name: `${workbookIds[0]}:MERGE_X_ACCOUNT_TOKEN`,
        value: accountToken,
        environmentId,
        spaceId,
      })

      await tick(80, 'Created MERGE_X_ACCOUNT_TOKEN secret...')

      // Create a job to sync the workbook immediately
      await api.jobs.create({
        type: 'workbook',
        operation: 'syncConnectedWorkbook',
        status: 'ready',
        source: workbookIds[0],
        trigger: 'immediate',
        mode: 'foreground',
      })

      await tick(90, 'Created workbook sync job...')

      return {
        outcome: {
          next: {
            type: 'id',
            id: workbookIds[0],
            label: 'Go to workbook...',
          },
          message: `We've created a connected Workbook that perfectly matches the Merge.dev schema for ${integration.name}, ensuring a seamless connection and easy synchronization going forward.`,
        },
      } as Flatfile.JobCompleteDetails
    } catch (e) {
      handleError(e, 'Error creating connected workbook')
    }
  }
}
