import { buildConfig } from '@flatfile/rollup-config';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'moment'
];

const config = buildConfig({
  input: 'src/index.ts', // Adjust this if your entry point is different
  external: [
    ...umdExternals,
    'moment' // Ensure moment is treated as external
  ],
  includeBrowser: true,
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileDateNormalizationPlugin', 
    external: umdExternals 
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json', // Make sure this points to your tsconfig.json
      declaration: true,
      declarationDir: 'dist/types',
    }),
  ],
});

export default config;