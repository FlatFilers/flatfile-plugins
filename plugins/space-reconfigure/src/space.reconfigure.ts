import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type TickFunction, jobHandler } from '@flatfile/plugin-job-handler'
import { matchWorkbooks } from './utils/workbook.matching'

const api = new FlatfileClient()

/**
 * `reconfigureSpace` is a higher-order function that creates a plugin to reconfigure an
 * existing workspace using the Flatfile API. This function takes a setup factory that may either
 * be a static setup configuration or a function that creates a setup configuration
 * given a FlatfileEvent.
 *
 * When the job:ready for space:reconfigure is emitted, the plugin will extract the necessary IDs,
 * create a configuration using the provided setup factory, update existing workbooks that match
 * the configuration, create new workbooks for unmatched configurations, and update the space
 * with the updated configuration.
 *
 * @param {SetupFactory} setup - The setup factory used to create the configuration for the workbooks.
 * This can either be a static Setup object or a function that creates a Setup object given a FlatfileEvent.
 *
 * @param {Function} callback - A callback function that is called after the workbooks are updated/created.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding a "space:reconfigure" event listener
 * and reconfiguring the space when the event is emitted.
 */
export function reconfigureSpace(
  setupFactory: SetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler('space:reconfigure', async (event, tick) => {
        const { spaceId, environmentId } = event.context
        const setup =
          typeof setupFactory === 'function'
            ? await setupFactory(event)
            : setupFactory

        await tick(10, 'Fetching existing workbooks')

        // Get existing workbooks in the space
        const existingWorkbooksResponse = await api.workbooks.list({
          spaceId,
        })
        const existingWorkbooks = existingWorkbooksResponse.data

        await tick(20, 'Matching workbooks to configuration')

        // Match workbook configurations to existing workbooks
        const { matches, unmatchedConfigs } = matchWorkbooks(
          existingWorkbooks,
          setup.workbooks
        )

        await tick(30, 'Updating existing workbooks')

        // Update existing workbooks
        const updatedWorkbookIds = await Promise.all(
          matches.map(async ({ existingWorkbook, configIndex }) => {
            const workbookConfig = setup.workbooks[configIndex]
            await api.workbooks.update(existingWorkbook.id, {
              environmentId,
              ...workbookConfig,
            })
            return existingWorkbook.id
          })
        )

        await tick(40, 'Creating new workbooks')

        // Create new workbooks for unmatched configurations
        const newWorkbookIds = await Promise.all(
          unmatchedConfigs.map(async ({ config }) => {
            const workbook = await api.workbooks.create({
              spaceId,
              environmentId,
              name: 'Workbook',
              ...config,
            })
            return workbook.data.id
          })
        )

        const allWorkbookIds = [...updatedWorkbookIds, ...newWorkbookIds]

        await tick(50, 'Workbooks updated and created')

        // Update space configuration
        if (setup.config?.maintainWorkbookOrder) {
          if (!setup.space) {
            setup.space = {}
          }

          setup.space.settings = {
            sidebarConfig: {
              workbookSidebarOrder: allWorkbookIds,
            },
          }
        }

        await tick(60, 'Updating space configuration')

        await api.spaces.update(spaceId, {
          environmentId: environmentId,
          primaryWorkbookId:
            allWorkbookIds && allWorkbookIds.length > 0 ? allWorkbookIds[0] : '',
          ...setup.space,
        })

        await tick(70, 'Updating documents')

        // Handle documents
        if (setup.documents) {
          for (const document of setup.documents) {
            await api.documents.create(spaceId, document)
          }
        }

        await tick(80, 'Finalizing reconfiguration')

        if (callback) {
          await callback(event, allWorkbookIds, tick)
        }

        return { info: 'Space reconfigured' }
      })
    )
  }
}

export type SetupFactory =
  | Setup
  | ((event: FlatfileEvent) => Setup | Promise<Setup>)

export type Setup = {
  workbooks: PartialWb[]
  space?: Partial<Flatfile.SpaceConfig>
  documents?: Flatfile.DocumentConfig[]
  config?: {
    maintainWorkbookOrder?: boolean
  }
}

export type PartialWb = Partial<Flatfile.CreateWorkbookConfig>
