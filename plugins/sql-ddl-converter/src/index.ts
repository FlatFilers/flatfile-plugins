import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type SqlSetupFactory } from './setup.factory'

export function configureSpaceWithSqlDDL(
  setupFactory: SqlSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export * from './setup.factory'
