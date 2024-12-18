import type { FlatfileEvent } from '@flatfile/listener'
import { FlatfileTickFunction } from '../../record-hook/src'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type SqlSetupFactory } from './setup.factory'

export function configureSpaceWithSqlDDL(
  setupFactory: SqlSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: FlatfileTickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export * from './setup.factory'
