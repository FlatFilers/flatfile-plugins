import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'

import { generateSetup } from './setup.factory'

export function configureSpaceWithJsonSchema(
  name: string,
  url: string,
  options?:{},
  callback?: ()=> unknown | Promise<unknown>
){

  return async function ( listener: FlatfileListener ){
    listener.use(configureSpace(await generateSetup(name, url)))
  }
}

export type { SetupFactory } from '@flatfile/plugin-space-configure'
