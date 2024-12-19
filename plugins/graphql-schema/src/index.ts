import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'
import type { GraphQLSetupFactory } from './types'

export function configureSpaceGraphQL(
  setupFactory: GraphQLSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return configureSpace((event) => generateSetup(setupFactory, event), callback)
}
