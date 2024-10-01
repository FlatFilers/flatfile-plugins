import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  '@flatfile/util-common',
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfilePivotTablePlugin', external: umdExternals },
  external: [
    ...umdExternals,
    'typescript',
  ],
});

// Add TypeScript plugin to all configs
config.forEach(conf => {
  conf.plugins.push(typescript({
    tsconfig: './tsconfig.json',
    declaration: false, // Declarations are handled separately
  }));
});

// Ensure the TypeScript declaration file is generated
const dtsConfig = config.find(conf => conf.output.file?.endsWith('.d.ts'));
if (dtsConfig) {
  dtsConfig.plugins = dtsConfig.plugins.filter(plugin => plugin.name !== 'typescript');
  dtsConfig.plugins.push(typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
  }));
}

export default config;