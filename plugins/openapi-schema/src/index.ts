import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type OpenAPISetupFactory } from './setup.factory'

export function configureSpaceWithOpenAPI(
  setupFactory: OpenAPISetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
