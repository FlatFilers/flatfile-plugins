import { buildConfig } from '@flatfile/bundler-config-rollup'

const config = buildConfig({
  includeNode: false,
  includeBrowser: false,
  includeDefinitions: false,
  includeUmd: true,
  umdConfig: { name: 'UtilKVStore' },
})

export default config
