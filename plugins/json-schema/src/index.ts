import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { JsonSetupFactory } from './setup.factory'

import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'

export function configureSpaceWithJsonSchema(
  setupFactory: JsonSetupFactory,
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

export * from './setup.factory'
