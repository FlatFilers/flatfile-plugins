import { buildConfig } from '@flatfile/rollup-config'

const external = ['@flatfile/util-common']

const config = buildConfig({ external })

export default config
