import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  'anthropic'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'AnthropicFlatfilePlugin', external: umdExternals },
  external: [
    ...umdExternals,
    '@flatfile/hooks',
    '@flatfile/util-common'
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      include: ['src/**/*.ts']
    })
  ]
});

export default config;