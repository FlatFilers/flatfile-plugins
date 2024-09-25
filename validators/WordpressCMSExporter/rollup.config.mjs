import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  'axios',
  'node-html-parser'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { 
    name: 'WordpressCMSExport', 
    external: umdExternals 
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    })
  ]
});

// Ensure all builds use the TypeScript plugin
config.forEach(conf => {
  if (!conf.plugins.find(plugin => plugin.name === 'typescript')) {
    conf.plugins.push(typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
    }));
  }
});

export default config;