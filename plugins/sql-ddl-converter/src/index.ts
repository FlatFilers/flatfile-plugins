import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { PartialWorkbookConfig } from '@flatfile/plugin-convert-json-schema'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { ModelsToSheetConfig, generateSetup } from './setup.factory'

export function configureSpaceWithSqlDDL(
  sqlDdlPath: string,
  options?: {
    models?: ModelsToSheetConfig
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  },
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(
      configureSpace(await generateSetup(sqlDdlPath, options), callback)
    )
  }
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
