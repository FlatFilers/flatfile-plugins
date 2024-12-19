import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import {
  type PartialSheetConfig,
  generateSetup,
} from '@flatfile/plugin-convert-openapi-schema'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import type { Setup } from '@flatfile/plugin-space-configure'
import { MergeClient } from '@mergeapi/merge-node-client'
import {
  CATEGORY_MODELS,
  MERGE_ACCESS_KEY,
  SYNC_RETRY_INTERVAL_MS,
} from './config'
import { checkAllSyncsComplete } from './sync.status.check'
import { getMergeClient, getSecret, handleError, snakeToCamel } from './utils'

const api = new FlatfileClient()

export function handleCreateConnectedWorkbooks() {
  return async (event: FlatfileEvent, tick: TickFunction) => {
    try {
      const { spaceId, environmentId, jobId } = event.context

      const job = await api.jobs.get(jobId)
      const jobInput = job.data.input
      const publicToken = jobInput?.publicToken
      const apiKey = await getSecret(spaceId, environmentId, MERGE_ACCESS_KEY)

      if (!apiKey) {
        throw new Error('Missing Merge API key')
      }

      // This MergeClient is used to retrieve the account token
      const tmpMergeClient: MergeClient = getMergeClient(apiKey)

      // Since we don't know what categories the Merge integration belongs to, we need to try each one to find
      // an account token. However an integration can belong to multiple categories, so the category that
      // provides the account token may not be the same category that the user selected. We'll just use the
      // first one that works.
      let accountTokenObj
      const mergeCategories = Object.keys(CATEGORY_MODELS)
      for (const categoryAttempt of mergeCategories) {
        try {
          accountTokenObj =
            await tmpMergeClient[
              categoryAttempt as keyof typeof mergeClient
            ].accountToken.retrieve(publicToken)
          if (accountTokenObj) {
            break // break out of the loop as soon as a valid account token is retrieved
          }
        } catch (e) {} // ignore and keep trying
      }

      if (!accountTokenObj) {
        throw new Error('Error retrieving account token')
      }

      // The accountToken is tied to the category selected during the Merge integration setup.
      // The `integration.categories` is just a list of all the categories the integration belongs to.
      const {
        accountToken,
        integration: { name, categories },
      } = accountTokenObj

      // This MergeClient is provided the `accountToken` and can be used to retrieve the category
      const mergeClient: MergeClient = getMergeClient(apiKey, accountToken)

      // We can retrieve the category off of the modelId of the first synced model
      let results
      do {
        results = await checkAllSyncsComplete(
          mergeClient,
          // Merge doesn't seem to care what category is used here, it will return the same results regardless
          // And since we are searching for the category, we'll just use the first one the integration has listed
          categories[0]
        )
        await new Promise((resolve) =>
          setTimeout(resolve, SYNC_RETRY_INTERVAL_MS)
        )
      } while (results.syncedModels.length === 0)

      // The modelId is prefix with the category for the given accountToken
      const category = results.syncedModels[0].modelId.split('.')[0]
      if (!category) {
        throw new Error('Error retrieving category')
      }

      await tick(20, 'Retrieved account token...')

      // Using the category, we can fetch Merge's schema provided through their OpenAPI spec and convert
      // it to a Flatfile sheet config
      const models = CATEGORY_MODELS[category]
      const sheets: PartialSheetConfig[] = Object.keys(models).map((key) => {
        const model = models[key]
        return {
          name: key,
          slug: model,
          model: key,
        }
      })

      const config: Setup = await generateSetup({
        workbooks: [
          {
            source: `https://api.merge.dev/api/${category}/v1/schema`,
            sheets,
          },
        ],
      })
      config.workbooks.map((workbook) => {
        workbook.sheets.map((sheet) => {
          sheet.fields.map((field) => {
            // Merge's OpenAPI spec uses snake_case, but Merge's API uses camelCase
            field.key = snakeToCamel(field.key)
            delete field.description
          })
        })
      })

      await tick(40, 'Retrieved sheet config...')

      const workbookIds = await Promise.all(
        config.workbooks.map(async (workbookConfig) => {
          const request: Flatfile.CreateWorkbookConfig = {
            ...workbookConfig,
            spaceId,
            environmentId,
            name,
            labels: ['connection'],
            actions: [
              {
                operation: 'syncConnectedWorkbook',
                mode: 'foreground',
                label: 'Sync',
                type: 'string',
                description: `Sync data from ${name}.`,
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
          }
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
            id: workbookIds[0], //pick first
            label: 'Go to workbook...',
          },
          message: `We've created a connected Workbook that perfectly matches the Merge.dev schema for ${name}, ensuring a seamless connection and easy synchronization going forward.`,
        },
      } as Flatfile.JobCompleteDetails
    } catch (e) {
      handleError(e, 'Error creating connected workbook')
    }
  }
}
