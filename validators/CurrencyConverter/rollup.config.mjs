import { buildConfig } from '@flatfile/rollup-config';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  'axios'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'CurrencyConverterPlugin', external: umdExternals },
  external: [
    ...umdExternals,
    'axios'
  ]
});

// Add custom plugins to all builds
const customPlugins = [
  resolve({
    preferBuiltins: true,
    browser: false
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist/types',
  })
];

// Modify each build configuration to include custom plugins
config.forEach(conf => {
  conf.plugins = [...(conf.plugins || []), ...customPlugins];
});

export default config;