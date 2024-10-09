import { buildConfig } from '@flatfile/rollup-config';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'sentiment'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileSentimentAnalysisPlugin', 
    external: umdExternals 
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/types',
    }),
  ],
});

export default config;