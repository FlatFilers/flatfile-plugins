import { faker } from '@faker-js/faker'
import { FlatfileClient, type Flatfile } from '@flatfile/api'
import { type FlatfileEvent, type FlatfileListener } from '@flatfile/listener'
import { createAllRecords } from '@flatfile/util-common'
import { GenerateExampleRecordsOptions } from './faker.plugin'

const api = new FlatfileClient()

export const generateExampleRecords = async (
  event: FlatfileEvent,
  options: GenerateExampleRecordsOptions
): Promise<Flatfile.RecordData[]> => {
  const { count = 1000, batchSize = 1000 } = options

  const {
    data: { config: sheetConfig },
  } = await api.sheets.get(event.context.sheetId)
  const records: Flatfile.RecordData[] = []

  const generateBatch = (batchSize: number): Flatfile.RecordData[] => {
    const batch: Flatfile.RecordData[] = []

    for (let i = 0; i < batchSize; i++) {
      const record: Flatfile.RecordData = {}

      for (const field of sheetConfig.fields) {
        const { key, type, label } = field as Flatfile.Property
        let config = {}
        if (
          field.type === 'enum' ||
          field.type === 'reference' ||
          field.type === 'reference-list'
        ) {
          config = field.config
        }

        try {
          // Generate data based on field type and label
          record[key] = { value: generateFieldData(type, label || key, config) }

          // Apply constraints if configured
          applyConstraints(record, key, config)
        } catch (error) {
          console.error(`Error generating data for field ${key}:`, error)
          record[key] = { value: `Error: ${error.message}` }
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

    await createAllRecords(event.context.sheetId, batch)

    await api.jobs.update(event.context.jobId, {
      info: `Generated ${records.length} of ${count} records`,
      progress: (records.length / count) * 100,
    })
  }

  await api.jobs.complete(event.context.jobId, {
    info: `Generated ${records.length} records`,
  })

  return records
}

// Helper function to generate field data based on type and label
function generateFieldData(type: string, label: string, config?: any): any {
  switch (type) {
    case 'string':
      return generateStringData(label)
    case 'number':
      return generateNumberData(label)
    case 'boolean':
      return faker.datatype.boolean()
    case 'date':
      return generateDateData(label)
    case 'enum':
      return generateEnumData(config)
    case 'reference':
      return generateReferenceData(config)
    case 'array':
      return generateArrayData(config)
    default:
      throw new Error(`Unsupported field type: ${type}`)
  }
}

// Helper functions for generating specific data types
function generateStringData(label: string): string {
  if (label.toLowerCase().includes('first name')) {
    return faker.person.firstName()
  } else if (label.toLowerCase().includes('last name')) {
    return faker.person.lastName()
  } else if (label.toLowerCase().includes('name')) {
    return faker.person.fullName()
  } else if (label.toLowerCase().includes('email')) {
    return faker.internet.email()
  } else if (label.toLowerCase().includes('phone')) {
    return faker.phone.number()
  } else if (label.toLowerCase().includes('address')) {
    return faker.location.streetAddress()
  } else if (label.toLowerCase().includes('city')) {
    return faker.location.city()
  } else if (label.toLowerCase().includes('state')) {
    return faker.location.state()
  } else if (label.toLowerCase().includes('zip')) {
    return faker.location.zipCode()
  } else if (label.toLowerCase().includes('country')) {
    return faker.location.country()
  }
  return faker.lorem.word()
}

function generateNumberData(label: string): number {
  if (label.toLowerCase().includes('age')) {
    return faker.number.int({ min: 18, max: 100 })
  } else if (
    label.toLowerCase().includes('price') ||
    label.toLowerCase().includes('amount')
  ) {
    return parseFloat(faker.commerce.price())
  }
  return faker.number.int()
}

function generateDateData(label: string): string {
  if (label.toLowerCase().includes('birth')) {
    return faker.date.past({ years: 80 }).toDateString()
  }
  return faker.date.recent({ days: 1 }).toDateString()
}

function generateEnumData(config: any): string {
  if (config && config.options) {
    const options = config.options as string[]
    return faker.helpers.arrayElement(options)
  }
  throw new Error('Enum field is missing options')
}

function generateReferenceData(config: any): string {
  if (config && config.ref) {
    return faker.string.uuid()
  }
  throw new Error('Reference field is missing ref configuration')
}

function generateArrayData(config: any): any[] {
  if (config && config.arrayType === 'string') {
    return faker.helpers.arrayElements(['lorem', 'ipsum', 'dolor'], {
      min: 2,
      max: 5,
    })
  } else if (config && config.arrayType === 'number') {
    return faker.helpers
      .arrayElements([1, 2, 3, 4, 5], { min: 2, max: 5 })
      .map(Number)
  } else {
    // Default to string array if arrayType is not specified
    return faker.helpers.arrayElements(['lorem', 'ipsum', 'dolor'], {
      min: 2,
      max: 5,
    })
  }
}

// Apply constraints to the generated data
function applyConstraints(
  record: Flatfile.RecordData,
  key: string,
  config: any
): void {
  if (config) {
    if (config.min !== undefined && typeof record[key].value === 'number') {
      record[key].value = Math.max(record[key].value as number, config.min)
    }
    if (config.max !== undefined && typeof record[key].value === 'number') {
      record[key].value = Math.min(record[key].value as number, config.max)
    }
    if (config.unique) {
      record[key].value = `${record[key].value}_${faker.string.uuid()}`
    }
  }
}
