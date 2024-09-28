import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-xlsx-extractor',
  '@flatfile/plugin-delimiter-extractor',
  '@flatfile/plugin-record-hook',
  '@flatfile/plugin-export-workbook',
  '@flatfile/plugin-automap',
  'fs',
  'path',
  'child_process',
  'util',
  'handlebars',
  'jszip',
  'chart.js'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfileStaticSiteGenerator', external: umdExternals },
  external: [
    ...umdExternals,
    'fs/promises',
  ],
});

// Add TypeScript configuration
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  conf.plugins.push(typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationDir: undefined,
  }));
});

// Add source mapping
config.forEach(conf => {
  conf.output = conf.output.map(output => ({
    ...output,
    sourcemap: true,
  }));
});

export default config;