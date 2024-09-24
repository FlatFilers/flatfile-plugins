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
  'nspell',
  'fs',
  'path'
];

const config = buildConfig({
  input: 'src/index.ts', // Adjust this if your entry point is different
  includeUmd: true,
  umdConfig: { name: 'FlatfileSpellCheckPlugin', external: umdExternals },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
    resolve({
      preferBuiltins: true,
      browser: true,
    }),
    commonjs(),
    json(),
  ],
});

// Add custom configuration for handling dictionary files
config.forEach(conf => {
  if (!conf.output) return;
  
  conf.output.forEach(output => {
    if (output.format === 'es' || output.format === 'cjs') {
      output.assetFileNames = 'assets/[name][extname]';
    }
  });
  
  conf.plugins.push({
    name: 'copy-dictionary-files',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'assets/dictionaries/en_US.dic',
        source: 'src/dictionaries/en_US.dic'
      });
      this.emitFile({
        type: 'asset',
        fileName: 'assets/dictionaries/en_US.aff',
        source: 'src/dictionaries/en_US.aff'
      });
    }
  });
});

export default config;