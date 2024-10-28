import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { configureSpace, type Setup } from '@flatfile/plugin-space-configure'
import { generateSetup, type JsonSetupFactory } from './setup.factory'

export function configureSpaceWithJsonSchema(
  setupFactory: JsonSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return configureSpace((_event: FlatfileEvent): Promise<Setup> => {
    return generateSetup(setupFactory) as Promise<Setup>
  }, callback)
}

export * from './setup.factory'
