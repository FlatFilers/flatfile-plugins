import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/plugin-record-hook',
  '@flatfile/listener',
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'flatfileIsbnPlugin', external: umdExternals },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
});

// Ensure all builds output TypeScript declarations
config.forEach(conf => {
  if (conf.plugins) {
    conf.plugins.push(
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      })
    );
  }
});

export default config;