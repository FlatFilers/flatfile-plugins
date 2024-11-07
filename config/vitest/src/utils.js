import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const loadEnv = (mode) => {
  const envPath = path.resolve('../../', `.env.${mode}`)
  const defaultEnvPath = path.resolve('../../', '.env')

  let env = {}

  if (fs.existsSync(envPath)) {
    env = { ...env, ...dotenv.parse(fs.readFileSync(envPath)) }
  }

  if (fs.existsSync(defaultEnvPath)) {
    env = { ...env, ...dotenv.parse(fs.readFileSync(defaultEnvPath)) }
  }

  // Resolve environment variables that reference other variables
  Object.keys(env).forEach((key) => {
    const value = env[key]
    if (
      typeof value === 'string' &&
      value.startsWith('${') &&
      value.endsWith('}')
    ) {
      const referencedKey = value.slice(2, -1)
      if (env[referencedKey]) {
        env[key] = env[referencedKey]
      }
    }
  })

  return env
}

export default loadEnv
