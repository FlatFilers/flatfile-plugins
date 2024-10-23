import { buildConfig } from '@flatfile/bundler-config-rollup'

const external = ['@flatfile/plugin-record-hook']

const config = buildConfig({ external })

export default config
