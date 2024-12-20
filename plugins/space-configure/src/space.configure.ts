import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type TickFunction, jobHandler } from '@flatfile/plugin-job-handler'

const api = new FlatfileClient()

/**
 * `configureSpace` is a higher-order function that creates a plugin to configure a
 * workspace using the Flatfile API. This function takes a setup factory that may either
 * be a static setup configuration or a function that creates a setup configuration
 * given a FlatfileEvent.
 *
 * When the job:ready for space:configure is emitted, the plugin will extract the necessary IDs, create a
 * configuration using the provided setup factory, create a workbook with this configuration,
 * and update the space with the workbook ID as the primary workbook ID.
 *
 * @param {SetupFactory} setup - The setup factory used to create the configuration for the workbook.
 * This can either be a static Setup object or a function that creates a Setup object given a FlatfileEvent.
 *
 * @param {Function} callback - A callback function that is called after the workbook is created.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding a "space:configure" event listener
 * and configuring the space when the event is emitted.
 */
export function configureSpace(
  setupFactory: SetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler('space:configure', async (event, tick) => {
        const { spaceId, environmentId } = event.context
        const setup =
          typeof setupFactory === 'function'
            ? await setupFactory(event)
            : setupFactory
        const workbookIds = await Promise.all(
          setup.workbooks.map(async (workbookConfig) => {
            const workbook = await api.workbooks.create({
              spaceId,
              environmentId,
              name: 'Workbook',
              ...workbookConfig,
            })
            return workbook.data.id
          })
        )
        await tick(50, 'Workbook created')

        if (setup.config?.maintainWorkbookOrder) {
          if (!setup.space) {
            setup.space = {}
          }

          setup.space.settings = {
            sidebarConfig: {
              workbookSidebarOrder: workbookIds,
            },
          }
        }

        await api.spaces.update(spaceId, {
          environmentId: environmentId,
          primaryWorkbookId:
            workbookIds && workbookIds.length > 0 ? workbookIds[0] : '',
          ...setup.space,
        })

        if (setup.documents) {
          for (const document of setup.documents) {
            await api.documents.create(spaceId, document)
          }
        }

        if (callback) {
          await callback(event, workbookIds, tick)
        }
        return { info: 'Space configured' }
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
