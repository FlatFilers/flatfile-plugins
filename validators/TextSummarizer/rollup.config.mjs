import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'compromise'
];

const config = buildConfig({
  includeUmd: true,
  umdConfig: { name: 'FlatfileSummarizer', external: umdExternals },
  external: [
    ...umdExternals,
    'compromise'
  ]
});

// Add TypeScript support to all configurations
config.forEach(conf => {
  if (!conf.plugins) conf.plugins = [];
  conf.plugins.unshift(
    typescript({ tsconfig: './tsconfig.json' }),
    nodeResolve({ preferBuiltins: true }),
    commonjs()
  );
});

// Ensure proper handling of 'compromise' as an external dependency
config.forEach(conf => {
  if (conf.output && conf.output.format === 'umd') {
    conf.output.globals = {
      ...conf.output.globals,
      'compromise': 'nlp'
    };
  }
});

export default config;