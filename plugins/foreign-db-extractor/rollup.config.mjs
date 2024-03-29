import { buildConfig } from '../../rollup.config.mjs'

const config = buildConfig({ includeBrowser: false })

export default config
