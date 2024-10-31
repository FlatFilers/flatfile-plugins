import { type Flatfile, FlatfileClient } from '@flatfile/api'
import { type FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { Simplified } from '@flatfile/util-common'
import { asyncMap } from 'modern-async'
import { randomUUID } from 'node:crypto'

const api = new FlatfileClient()

/**
 * Auto update plugin that will trigger a schema update for a space
 * on deployment of new code.
 *
 * @example ```ts
 *
 * const updater = rollout({
 *   namespace: 'workbook:foobar',
 *   dev: process.env.NODE_ENV === 'development',
 *   updater: async (space, workbooks) => {
 *     // call the api to update the workbook schema using whatever logic you have
 *     // return a list of workbooks that you want to trigger hooks for
 *     return workbooks
 *   }
 * })
 *
 * // wherever you have workbook setup
 * filteredListener.use(updater)
 *
 * // at the root in order to catch all agent updates which are global
 * listener.use(autoUpdate.root)
 * ```
 *
 * @param config
 */
export function rollout(config: {
  namespace: string
  dev: boolean
  updater: (
    space: Flatfile.Space,
    workbooks: Flatfile.Workbook[]
  ) => Promise<undefined | Flatfile.Workbook[]>
}) {
  async function prepareUpdate(dev: boolean = false) {
    const { data: spaces } = await api.spaces.list({
      archived: false,
      namespace: config.namespace.split(':')[1],
      pageSize: 1000,
    })

    console.log(`Fetched ${spaces.length} spaces`)
    const spacesWithSecrets = await asyncMap(
      spaces,
      async (space) => {
        const { data: secrets } = await api.secrets.list({ spaceId: space.id })
        return { space, secrets }
      },
      10
    )
    console.log(`Hydrated secrets for ${spacesWithSecrets.length} spaces`)

    const prodUpdate = spacesWithSecrets.filter(({ secrets }) => {
      return secrets.some(
        (s) => s.name === 'FF_AUTO_UPDATE' && s.value === 'true'
      )
    })

    const devUpdate = spacesWithSecrets.filter(({ secrets }) => {
      return secrets.some(
        (s) => s.name === 'FF_AUTO_UPDATE_DEV' && s.value === 'true'
      )
    })

    const updatedList = await asyncMap(
      dev ? devUpdate : prodUpdate,
      ({ space }) => {
        return triggerUpdateJobForSpace(space)
      }
    )

    // loop through each and determine if it needs to be updated by checking secrets
    console.log(`Triggered schema for ${updatedList.length} spaces`)
  }

  async function triggerUpdateJobForSpace(space: Flatfile.Space) {
    await api.jobs.create({
      type: 'space',
      source: space.id,
      operation: 'auto-update',
      trigger: 'immediate',
      managed: true,
      mode: 'foreground',
      environmentId: space.environmentId,
    })
  }

  const cb = (listener: FlatfileListener) => {
    const isLambda = !!process.env.LAMBDA_TASK_ROOT

    if (!isLambda && config.dev) {
      prepareUpdate(true).then(() => {
        console.log(
          'running local dev refresh based update of spaces, suppress this with dev=false in the autoUpdate plugin config'
        )
      })
    }

    const triggerHooks = async (sheetId: string) => {
      // loop through all records and increment metadata somehow triggering a new version
      // this will trigger the auto update to run
      const uuid = randomUUID()
      console.log('Hooks updating =>', sheetId)

      const records = await Simplified.getAllRecords(sheetId)
      const updatedRecords = records.map((record) => {
        record.metadata = {
          ...((record.metadata as any) || {}),
          _autoUpdateKey: uuid,
        }
        return record
      })

      await Simplified.updateAllRecords(sheetId, updatedRecords)
      console.log('Hooks updated =>', sheetId)
    }

    listener.use(
      jobHandler('space:auto-update', async (e) => {
        const { data: space } = await api.spaces.get(e.context.spaceId)
        // which workbook to update
        const { data: workbooks } = await api.workbooks.list({
          spaceId: space.id,
        })
        const updated = await config.updater(
          space,
          workbooks.filter((wb) => !wb.name.includes('[file]'))
        )
        if (updated?.length) {
          await asyncMap(updated, async (wb) => {
            console.log('workbook schema updated, triggering hooks', wb.id)
            await asyncMap(
              wb.sheets,
              (sheet) => {
                return triggerHooks(sheet.id)
              },
              10
            )
          })
        }
        return { info: 'Successfully updated schema' }
      })
    )
  }

  cb.root = (listener: FlatfileListener) => {
    listener.on('agent:created', () => prepareUpdate(false))
    listener.on('agent:updated', () => prepareUpdate(false))
  }

  return cb
}
