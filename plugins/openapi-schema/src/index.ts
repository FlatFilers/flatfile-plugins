import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import {
  ModelsToSheetConfig,
  PartialWorkbookConfig,
  generateSetup,
} from './setup.factory'

export function configureSpaceWithOpenAPI(
  url: string,
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
    listener.use(configureSpace(await generateSetup(url, options), callback))
  }
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
