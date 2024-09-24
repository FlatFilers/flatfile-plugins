import { buildConfig } from '@flatfile/rollup-config';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
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
  input: 'src/index.ts', // Adjust this if your entry file is different
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileGeocodingPlugin', 
    external: umdExternals 
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
  ]
});

// Add external dependencies
const external = [
  ...umdExternals,
  'axios',
];

// Modify each build configuration to include external dependencies
config.forEach(buildConfig => {
  buildConfig.external = external;
});

export default config;