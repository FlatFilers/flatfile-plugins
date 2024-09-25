import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'axios'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileWordPressExport', 
    external: umdExternals 
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types'
    }),
    resolve({
      browser: true
    }),
    commonjs(),
    json()
  ]
});

// Add custom configuration for TypeScript handling
config.forEach(conf => {
  if (conf.plugins) {
    conf.plugins.unshift(typescript({
      tsconfig: './tsconfig.json',
      declaration: false
    }));
  }
});

export default config;