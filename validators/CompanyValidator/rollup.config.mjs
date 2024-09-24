import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  '@googlemaps/google-maps-services-js',
  'axios'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { 
    name: 'CompanyValidationPlugin', 
    external: umdExternals 
  },
  external: [
    ...umdExternals,
    'crypto',
    'stream',
    'http',
    'https',
    'url',
    'zlib'
  ]
});

// Add TypeScript support to all configurations
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  conf.plugins.unshift(
    typescript({ tsconfig: './tsconfig.json' }),
    commonjs(),
    resolve({
      preferBuiltins: true,
      browser: conf.output.format === 'umd'
    }),
    json()
  );
});

export default config;