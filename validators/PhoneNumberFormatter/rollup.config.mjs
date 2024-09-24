import { buildConfig } from '@flatfile/rollup-config'

const umdExternals = [
  '@flatfile/api',
  '@flatfile/plugin-record-hook',
  '@flatfile/listener',
]

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfilePhoneNumberValidator', external: umdExternals },
})

export default config
