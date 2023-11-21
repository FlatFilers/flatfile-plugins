import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { JsonSetupFactory, generateSetup } from '@flatfile/util-fetch-schema'

export function configureSpaceWithJsonSchema(
  setupFactory: JsonSetupFactory,
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
