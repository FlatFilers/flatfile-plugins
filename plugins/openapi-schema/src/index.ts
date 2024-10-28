import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { configureSpace, type Setup } from '@flatfile/plugin-space-configure'
import { generateSetup, type OpenAPISetupFactory } from './setup.factory'

export function configureSpaceWithOpenAPI(
  setupFactory: OpenAPISetupFactory,
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

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export * from './setup.factory'
