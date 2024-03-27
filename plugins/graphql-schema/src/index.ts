import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'
import type { GraphQLSetupFactory } from './types'

export function configureSpaceGraphQL(
  setupFactory: GraphQLSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async (listener: FlatfileListener) => {
    listener.use(
      configureSpace((event) => generateSetup(setupFactory, event), callback)
    )
  }
}
