import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetup } from './setup.factory'

export default function configureSpaceWithOpenAPI(
  url: string,
  models?: Record<string, string>,
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    listener.use(configureSpace(await generateSetup(url, models), callback))
  }
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
export { generateSetup } from './setup.factory'
