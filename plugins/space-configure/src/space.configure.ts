import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'
import { jobHandler } from '@flatfile/plugin-job-handler'

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
 * @returns {Function} Returns a function that takes a FlatfileListener, adding a "space:configure" event listener
 * and configuring the space when the event is emitted.
 */
export function configureSpace(setup: SetupFactory) {
  // Returns a function which will configure a listener
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler('space:configure', async (event) => {
        // Extracting the spaceId and environmentId from the event context
        const { spaceId, environmentId } = event.context

        // Creating a configuration using the setup factory
        const config = typeof setup === 'function' ? await setup(event) : setup

        // Creating a workbook with the created configuration
        const workbook = await api.workbooks.create({
          spaceId,
          environmentId,
          name: 'Workbook',
          ...config.workbook,
        })
        // Extracting the workbookId from the created workbook
        const workbookId = workbook.data.id

        // If a workbookId was created, updating the space to use the workbookId as the primary workbook ID
        if (workbookId) {
          await api.spaces.update(spaceId, {
            environmentId: environmentId,
            primaryWorkbookId: workbookId,
            ...config.space,
          })
        }
        return { info: 'Space configured' }
      })
    )
  }
}

// Defining types used in the configureSpace function
type SetupFactory = Setup | ((event: FlatfileEvent) => Setup | Promise<Setup>)
type Setup = {
  workbook: PartialWb
  space?: Partial<Flatfile.spaces.SpaceConfig>
}
type PartialWb = Partial<Flatfile.CreateWorkbookConfig>
