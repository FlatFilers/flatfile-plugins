import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { FlatfileRecord } from '@flatfile/plugin-record-hook'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { logInfo, logError } from '@flatfile/util-common'
import { createHash } from 'node:crypto'

export interface AnonymizeOptions {
  sheet: string
  field: string
  salt?: string
  preserveDomain?: boolean
  debug?: boolean
  chunkSize?: number
  parallel?: number
}

export function anonymize(options: AnonymizeOptions) {
  const {
    sheet,
    field,
    salt = '',
    preserveDomain = false,
    debug = false,
    ...bulkOptions
  } = options

  return (listener: FlatfileListener) => {
    listener.use(
      bulkRecordHook(
        sheet,
        async (records: FlatfileRecord[], event: FlatfileEvent) => {
          if (debug) {
            logInfo(
              '@flatfile/plugin-anonymize',
              `Processing ${records.length} records for field '${field}'`
            )
          }

          let processedCount = 0
          let errorCount = 0

          records.forEach((record) => {
            try {
              const originalValue = record.get(field)

              if (!originalValue || typeof originalValue !== 'string') {
                if (debug && originalValue) {
                  logInfo(
                    '@flatfile/plugin-anonymize',
                    `Skipping non-string value: ${originalValue}`
                  )
                }
                return
              }

              const email = originalValue.trim()

              if (!isValidEmail(email)) {
                if (debug) {
                  logInfo(
                    '@flatfile/plugin-anonymize',
                    `Skipping invalid email: ${email}`
                  )
                }
                return
              }

              const anonymizedValue = anonymizeEmail(
                email,
                salt,
                preserveDomain
              )
              record.set(field, anonymizedValue)
              processedCount++

              if (debug) {
                logInfo(
                  '@flatfile/plugin-anonymize',
                  `Anonymized: ${email} -> ${anonymizedValue}`
                )
              }
            } catch (error) {
              errorCount++
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'

              record.addError(
                field,
                `Failed to anonymize email: ${errorMessage}`
              )

              if (debug) {
                logError(
                  '@flatfile/plugin-anonymize',
                  `Error processing record: ${errorMessage}`
                )
              }
            }
          })

          if (debug) {
            logInfo(
              '@flatfile/plugin-anonymize',
              `Completed processing: ${processedCount} anonymized, ${errorCount} errors`
            )
          }
        },
        bulkOptions
      )
    )
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function anonymizeEmail(
  email: string,
  salt: string,
  preserveDomain: boolean
): string {
  const [localPart, domain] = email.split('@')

  const hashInput = salt ? `${localPart}${salt}` : localPart

  const hash = createHash('md5').update(hashInput).digest('hex')

  if (preserveDomain && domain) {
    return `${hash}@${domain}`
  } else {
    const domainHash = createHash('md5')
      .update(domain + salt)
      .digest('hex')
    return `${hash}@${domainHash.substring(0, 8)}.com`
  }
}
