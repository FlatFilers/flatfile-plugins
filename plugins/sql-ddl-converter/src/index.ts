import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { SqlSetupFactory } from './setup.factory'

import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'

export function configureSpaceWithSqlDDL(
  setup: SqlSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(configureSpace(await generateSetup(setup), callback))
  }
}

export * from './setup.factory'
