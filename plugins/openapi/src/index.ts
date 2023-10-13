import { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { generateSetupFactory } from './blueprint.generator'

export default function openApiSchemaPlugin(url: string) {
  return async function (listener: FlatfileListener) {
    listener.use(configureSpace(await generateSetupFactory(url)))
  }
}
