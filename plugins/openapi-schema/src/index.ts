import type { FlatfileEvent } from '@flatfile/listener'
import { FlatfileTickFunction } from '../../record-hook/src'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type OpenAPISetupFactory } from './setup.factory'

export function configureSpaceWithOpenAPI(
  setupFactory: OpenAPISetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: FlatfileTickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
