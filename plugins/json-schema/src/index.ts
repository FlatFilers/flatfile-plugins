import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup, type JsonSetupFactory } from './setup.factory'

export function configureSpaceWithJsonSchema(
  setupFactory: JsonSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: FlatfileTickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(setupFactory), callback)
}

export * from './setup.factory'
