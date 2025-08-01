import { buildConfig } from '@flatfile/bundler-config-rollup'

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
]

const config = buildConfig({
  includeNode: false,
  includeBrowser: false,
  includeDefinitions: false,
  includeUmd: true,
  umdConfig: { name: 'PluginKVStore', external: umdExternals },
})

export default config
