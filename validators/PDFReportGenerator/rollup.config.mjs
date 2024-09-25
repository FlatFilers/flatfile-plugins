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
  '@flatfile/plugin-space-configure',
  'pdfkit',
  'chartjs-node-canvas'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is index.ts in the src directory
  external: [
    ...umdExternals,
    'fs',
    'path'
  ],
  includeBrowser: true,
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfilePDFGenerator', 
    external: umdExternals 
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
    commonjs(),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    json(),
  ]
});

export default config;