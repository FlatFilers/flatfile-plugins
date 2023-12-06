import * as crypto from 'crypto'
import sql from 'mssql'

export function generatePassword(length = 12) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%^&*()_+~`|}{[]:;<>,.?-='
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomBytes(1)[0] % charset.length
    password += charset[randomIndex]
  }

  return password
}

export function generateUsername() {
  const adjectives = [
    'Fast',
    'Quick',
    'Rapid',
    'Speedy',
    'Flying',
    'Wild',
    'Silent',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Swift',
    'Bright',
    'Dark',
    'Light',
  ]
  const nouns = [
    'Cheetah',
    'Eagle',
    'Falcon',
    'Panther',
    'Shark',
    'Tiger',
    'Wolf',
    'Lion',
    'Dragon',
    'Phoenix',
    'Hawk',
    'Sparrow',
    'Fox',
    'Bear',
    'Leopard',
  ]

  const randomNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]

  return `${randomAdjective}${randomNoun}${randomNumber}`
}

export function generateMssqlConnectionString(connConfig: sql.config) {
  return `Server=${connConfig.server};Port=${connConfig.options.port};User Id=${connConfig.user};Password='${connConfig.password}';Database=${connConfig.database};Encrypt=true;TrustServerCertificate=true;Connection Timeout=30;`
}
