import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { SchemaSetupFactory } from '@flatfile/util-fetch-schema'
import { generateSetup } from './setup.factory'

export function configureSpaceWithYamlSchema(
  setupFactory: SchemaSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(configureSpace(await generateSetup(setupFactory), callback))
  }
}

export * from './setup.factory'
