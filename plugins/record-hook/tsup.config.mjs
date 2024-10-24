import { defineConfig } from '@flatfile/bundler-config-tsup'

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
]

export default defineConfig({
  globalName: 'PluginRecordHook',
  includeUmd: true,
  umdConfig: { name: 'PluginRecordHook', external: umdExternals },
})
