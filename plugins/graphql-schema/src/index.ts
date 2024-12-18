import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'
import type { GraphQLSetupFactory } from './types'

export function configureSpaceGraphQL(
  setupFactory: GraphQLSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: FlatfileTickFunction
  ) => any | Promise<any>
) {
  return configureSpace((event) => generateSetup(setupFactory, event), callback)
}
