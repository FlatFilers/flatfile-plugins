import { buildConfig } from '@flatfile/rollup-config';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/plugin-record-hook',
  '@flatfile/listener',
  '@flatfile/util-common',
  'dns'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileEmailValidationPlugin', 
    external: umdExternals 
  },
  plugins: [
    json() // Add this to handle the JSON import for disposable domains
  ]
});

// Add Node.js built-in modules to external for all builds
const nodeBuiltins = ['dns'];
config.forEach(conf => {
  conf.external = (conf.external || []).concat(nodeBuiltins);
});

export default config;