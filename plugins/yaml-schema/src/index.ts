import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { SchemaSetupFactory, generateSetup } from '@flatfile/util-fetch-schema'
import jsYaml from 'js-yaml'

export function configureSpaceWithYamlSchema(
  setupFactory: SchemaSetupFactory,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(
      configureSpace(await generateSetup(setupFactory, jsYaml.load), callback)
    )
  }
}
