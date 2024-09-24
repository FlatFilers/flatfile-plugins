import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/util-common',
  'axios',
  'fast-xml-parser'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'StravaGPXFetcher', external: umdExternals },
  external: [
    ...umdExternals,
    'crypto',
    'util',
    'stream',
    'zlib',
    'http',
    'https',
    'url',
    'net'
  ]
});

// Add TypeScript configuration
config.forEach(conf => {
  if (conf.plugins) {
    conf.plugins.push(
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types/'
      })
    );
  }
});

// Ensure proper handling of dependencies
config.forEach(conf => {
  if (conf.plugins) {
    conf.plugins.unshift(
      nodeResolve({
        preferBuiltins: true,
        browser: conf.output.format === 'umd'
      }),
      commonjs(),
      json()
    );
  }
});

export default config;