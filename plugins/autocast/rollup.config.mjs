import { buildConfig } from '../../rollup.config.mjs'

const external = ['@flatfile/plugin-record-hook']

const config = buildConfig({ external })

export default config
