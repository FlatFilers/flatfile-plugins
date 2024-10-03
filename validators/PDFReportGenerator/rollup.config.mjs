import { buildConfig } from '@flatfile/rollup-config';

export default buildConfig({
  external: [
    '@flatfile/listener',
    '@flatfile/plugin-record-hook',
    'jspdf',
    'jspdf-autotable',
    'chart.js/auto',
    '@flatfile/api'
  ],
  includeBrowser: true
});