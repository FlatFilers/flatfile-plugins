import { buildConfig } from '@flatfile/bundler-config-rollup'

const external = ['@flatfile/util-common']

const config = buildConfig({ external })

export default config
