const dotenv = require('dotenv-flow')
const dotenvExpand = require('dotenv-expand')

const path = require('path')

const env = dotenv.config({
  path: path.join(__dirname, '..'),
})

dotenvExpand.expand(env)
