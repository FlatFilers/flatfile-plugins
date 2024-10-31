import { buildConfig } from '@flatfile/bundler-config-rollup'

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
]

const config = buildConfig({
  umdConfig: { name: 'PluginRecordHook', external: umdExternals },
})

export default config
