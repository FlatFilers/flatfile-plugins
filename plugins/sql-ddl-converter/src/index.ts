import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type SqlSetupFactory } from './setup.factory'

export function configureSpaceWithSqlDDL(
  setupFactory: SqlSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export * from './setup.factory'
