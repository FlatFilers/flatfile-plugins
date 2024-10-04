import { buildConfig } from '@flatfile/rollup-config';

export default buildConfig({
  external: [
    '@flatfile/listener',
    '@flatfile/plugin-record-hook',
    'pdf-lib',
    '@flatfile/api',
    'fs'
  ],
  includeBrowser: true,
  includeUmd: false
});