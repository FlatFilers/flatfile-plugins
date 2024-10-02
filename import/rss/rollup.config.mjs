import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/util-common',
  'axios',
  'rss-parser',
  'node-cron'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfileRSSImportPlugin', external: umdExternals },
  external: [
    ...umdExternals,
    'fs',
    'path'
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    })
  ]
});

// Ensure all configs use the TypeScript plugin
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  conf.plugins.unshift(typescript({
    tsconfig: './tsconfig.json',
    declaration: false
  }));
});

export default config;