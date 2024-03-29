import { buildConfig } from '../../rollup.config.mjs'

const internal = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
]

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'PluginRecordHook', internal },
})

export default config
