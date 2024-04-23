import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { OpenAPISetupFactory } from './setup.factory'

import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'

export function configureSpaceWithOpenAPI(
  setupFactory: OpenAPISetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(configureSpace(await generateSetup(setupFactory), callback))
  }
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
