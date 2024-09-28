import { buildConfig } from '@flatfile/rollup-config';

export default buildConfig({
  external: ['@flatfile/listener', '@flatfile/plugin-record-hook', 'isbn3'],
  includeBrowser: true,
  includeUmd: true,
  umdConfig: {
    name: 'FlatfileIsbnValidator',
    globals: {
      '@flatfile/listener': 'FlatfileListener',
      '@flatfile/plugin-record-hook': 'FlatfilePluginRecordHook',
      'isbn3': 'ISBN'
    }
  }
});