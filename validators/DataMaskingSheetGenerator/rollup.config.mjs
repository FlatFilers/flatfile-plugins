import { buildConfig } from '@flatfile/rollup-config';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'crypto'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { 
    name: 'DataMaskingSheetGenerator', 
    external: umdExternals 
  },
  external: [
    ...umdExternals,
    'crypto'
  ],
  includeBrowser: true, // Include browser build
});

export default config;