import loadEnv from './utils.js'

const config = ({ mode }) => {
  return {
    test: {
      environment: 'node',
      testTimeout: 30000,
      globals: true,
      env: {
        ...loadEnv(mode),
        TZ: 'UTC',
      },
    },
    plugins: [],
  }
}

export default config
