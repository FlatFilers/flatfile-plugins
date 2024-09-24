import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  '@google-cloud/translate'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfileTranslationPlugin', external: umdExternals },
  external: [
    ...umdExternals,
    '@google-cloud/translate/build/src/v2'
  ]
});

// Enhance the configuration for TypeScript
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  
  conf.plugins.unshift(
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationDir: null,
    }),
    json(),
    resolve({
      browser: conf.output.format === 'umd',
      preferBuiltins: conf.output.format !== 'umd'
    }),
    commonjs()
  );
});

// Add a separate configuration for generating type definitions
config.push({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      emitDeclarationOnly: true
    })
  ]
});

export default config;