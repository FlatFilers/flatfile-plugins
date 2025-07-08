import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type TickFunction, jobHandler } from '@flatfile/plugin-job-handler'

const api = new FlatfileClient()

/**
 * `configureSpaceFromTemplate` is a higher-order function that creates a plugin to configure a
 * workspace using the Flatfile API. This function takes a setup factory that may either
 * be a static setup configuration or a function that creates a setup configuration
 * given a FlatfileEvent.
 *
 * When the job:ready for space:configure is emitted, the plugin will extract the necessary IDs, create a
 * configuration using the provided setup factory, create a workbook with this configuration,
 * and update the space with the workbook ID as the primary workbook ID.
 *
 * @param {Function} callback - A callback function that is called after the workbook is created.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding a "space:configure" event listener
 * and configuring the space when the event is emitted.
 */
export function configureSpaceFromTemplate(
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler('space:configure', async (event, tick) => {
        try {
          const { spaceId, environmentId, appId } = event.context

          // Get all the space templates for the app sorted by creation date, oldest first
          const spaceTemplates = await api.spaces.list({
            appId,
            isAppTemplate: true,
            sortField: 'createdAt',
            sortDirection: 'asc',
          })

          if (spaceTemplates.data.length === 0) {
            throw new Error('No space template found')
          }

          // Get the oldest space template
          const spaceTemplate = spaceTemplates.data[0]
          const spaceTemplateId = spaceTemplate.id

          // Get all the workbooks for the space template
          const workbooks = await api.workbooks.list({
            spaceId: spaceTemplateId,
          })

          // Convert workbooks from the template to workbook configs
          const workbookConfigs: Flatfile.CreateWorkbookConfig[] =
            workbooks.data.map((workbook) => ({
              name: workbook.name,
              labels: workbook.labels,
              spaceId: spaceId,
              environmentId: environmentId,
              namespace: spaceTemplate.namespace,
              sheets: workbook.sheets.map((sheet) => ({
                ...sheet.config,
              })),
              actions: workbook.actions,
              settings: workbook.settings,
              metadata: workbook.metadata ?? {},
              treatments: workbook.treatments,
            }))

          // Create the workbooks
          const workbookIds = await Promise.all(
            workbookConfigs.map(async (workbookConfig) => {
              const workbook = await api.workbooks.create(workbookConfig)
              return workbook.data.id
            })
          )

          await tick(50, 'Workbook created')

          // Set some metadata on the space
          await api.spaces.update(spaceId, {
            primaryWorkbookId:
              workbookIds && workbookIds.length > 0 ? workbookIds[0] : '',
            settings: spaceTemplate.settings || {},
            metadata: spaceTemplate.metadata || {},
            actions: spaceTemplate.actions || [],
            access: spaceTemplate.access || [],
            labels: spaceTemplate.labels,
            translationsPath: spaceTemplate.translationsPath || '',
            languageOverride: spaceTemplate.languageOverride || '',
          })

          // Get all the documents for the space template...
          const documents = await api.documents.list(spaceTemplateId)

          // ...and create them in the new space
          for (const document of documents.data) {
            await api.documents.create(spaceId, document)
          }

          if (callback) {
            await callback(event, workbookIds, tick)
          }
          return { info: 'Space configured' }
        } catch (error: any) {
          console.log('Space configuration failed with error:', error)
          throw new Error('Space configuration failed')
        }
      })
    )
  }
}
