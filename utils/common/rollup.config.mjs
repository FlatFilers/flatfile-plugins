import { buildConfig } from '@flatfile/bundler-config-rollup'

const umdExternals = ['@flatfile/api', '@flatfile/listener']

const config = buildConfig({
  includeNode: false,
  includeBrowser: false,
  includeDefinitions: false,
  includeUmd: true,
  umdConfig: { name: 'UtilCommon', external: umdExternals },
})

export default config
