import { buildConfig } from '@flatfile/rollup-config'

const external = ['@flatfile/plugin-record-hook']

const config = buildConfig({ external })

export default config
