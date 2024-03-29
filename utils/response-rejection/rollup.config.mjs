import { buildConfig } from '../../rollup.config.mjs'

const external = ['@flatfile/util-common']

const config = buildConfig({ external })

export default config
