import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { generateExampleRecords } from './faker.utils'

export interface GenerateExampleRecordsOptions {
  job?: string
  count?: number
  batchSize?: number
}

export function fakerPlugin(options: GenerateExampleRecordsOptions) {
  return function (listener: FlatfileListener) {
    listener.on(
      'job:ready',
      { job: options.job || 'sheet:generateExampleRecords' },
      async (event: FlatfileEvent) => {
        await generateExampleRecords(event, options)
      }
    )
  }
}
