import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  'xml2js',
  'util'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { name: 'FlatfileGpxParser', external: umdExternals },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
  ],
});

// Add TypeScript plugin to all configs
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  conf.plugins.push(typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
  }));
});

export default config;