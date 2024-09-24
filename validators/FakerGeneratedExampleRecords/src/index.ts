import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { faker } from '@faker-js/faker'

interface GenerateExampleRecordsOptions {
  count: number
  locale?: string
  batchSize?: number
}

const generateExampleRecords = async (
  event: FlatfileEvent,
  options: GenerateExampleRecordsOptions
): Promise<FlatfileRecord[]> => {
  const { count, locale = 'en', batchSize = 1000 } = options

  faker.setLocale(locale)

  const sheetConfig = event.sheet
  const records: FlatfileRecord[] = []

  const generateBatch = (batchSize: number): FlatfileRecord[] => {
    const batch: FlatfileRecord[] = []

    for (let i = 0; i < batchSize; i++) {
      const record: FlatfileRecord = {}

      for (const field of sheetConfig.fields) {
        const { key, type, label, config } = field

        try {
          switch (type) {
            case 'string':
              if (label.toLowerCase().includes('name')) {
                record[key] = faker.name.fullName()
              } else if (label.toLowerCase().includes('email')) {
                record[key] = faker.internet.email()
              } else if (label.toLowerCase().includes('phone')) {
                record[key] = faker.phone.phoneNumber()
              } else if (label.toLowerCase().includes('address')) {
                record[key] = faker.address.streetAddress()
              } else {
                record[key] = faker.lorem.word()
              }
              break
            case 'number':
              if (label.toLowerCase().includes('age')) {
                record[key] = faker.datatype.number({ min: 18, max: 100 })
              } else if (
                label.toLowerCase().includes('price') ||
                label.toLowerCase().includes('amount')
              ) {
                record[key] = parseFloat(faker.commerce.price())
              } else {
                record[key] = faker.datatype.number()
              }
              break
            case 'boolean':
              record[key] = faker.datatype.boolean()
              break
            case 'date':
              if (label.toLowerCase().includes('birth')) {
                record[key] = faker.date.past(80).toISOString()
              } else {
                record[key] = faker.date.recent().toISOString()
              }
              break
            case 'enum':
              if (config && config.options) {
                const options = config.options as string[]
                record[key] = faker.random.arrayElement(options)
              } else {
                throw new Error(`Enum field "${key}" is missing options`)
              }
              break
            case 'reference':
              if (config && config.ref) {
                record[key] = faker.datatype.uuid()
              } else {
                throw new Error(
                  `Reference field "${key}" is missing ref configuration`
                )
              }
              break
            case 'array':
              if (config && config.arrayType === 'string') {
                record[key] = [
                  faker.lorem.word(),
                  faker.lorem.word(),
                  faker.lorem.word(),
                ]
              } else if (config && config.arrayType === 'number') {
                record[key] = [
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.datatype.number(),
                ]
              } else {
                throw new Error(
                  `Array field "${key}" has unsupported or missing arrayType`
                )
              }
              break
            default:
              throw new Error(
                `Unsupported field type "${type}" for field "${key}"`
              )
          }

          if (config) {
            if (config.min !== undefined && typeof record[key] === 'number') {
              record[key] = Math.max(record[key], config.min)
            }
            if (config.max !== undefined && typeof record[key] === 'number') {
              record[key] = Math.min(record[key], config.max)
            }
            if (config.unique) {
              record[key] = `${record[key]}_${faker.datatype.uuid()}`
            }
          }
        } catch (error) {
          record[key] = `Error: ${error.message}`
        }
      }

      batch.push(record)
    }

    return batch
  }

  const totalBatches = Math.ceil(count / batchSize)

  for (let i = 0; i < totalBatches; i++) {
    const remainingRecords = count - records.length
    const currentBatchSize = Math.min(batchSize, remainingRecords)

    const batch = generateBatch(currentBatchSize)
    records.push(...batch)

    if (event.update) {
      await event.update({
        message: `Generated ${records.length} of ${count} records`,
        progress: (records.length / count) * 100,
      })
    }
  }

  return records
}

export default function ExampleRecordsPlugin(listener: FlatfileListener) {
  listener.on('action:generateExampleRecords', async (event: FlatfileEvent) => {
    const options: GenerateExampleRecordsOptions = {
      count: event.payload?.count || 1000,
      locale: event.payload?.locale || 'en',
      batchSize: event.payload?.batchSize || 1000,
    }

    const records = await generateExampleRecords(event, options)

    await event.recordBatch(records)
  })
}
