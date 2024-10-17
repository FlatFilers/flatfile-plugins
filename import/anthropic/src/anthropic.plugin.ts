import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError, logInfo } from '@flatfile/util-common'
import { generateExampleRecords } from './anthropic.generator'

const api = new FlatfileClient()

export interface AnthropicGeneratorConfig {
  job: string
  numberOfRecords: number
  debug?: boolean
}

export function anthropicGenerator(config: AnthropicGeneratorConfig) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(`sheet:${config.job}`, async (event: FlatfileEvent, tick) => {
        const { sheetId } = event.context
        const anthropicApiKey = await event.secrets('ANTHROPIC_API_KEY')

        if (!anthropicApiKey) {
          logError(
            '@flatfile/plugin-import-anthropic',
            'Anthropic API key is not set'
          )
          throw new Error('Anthropic API key is not set')
        }

        try {
          await tick(30, 'Getting sheet config')
          const { data: sheet } = await api.sheets.get(sheetId)

          await tick(60, 'Generating example records')
          const exampleRecords = await generateExampleRecords(
            anthropicApiKey,
            sheet,
            config.numberOfRecords
          )
          if (config.debug) {
            console.dir(exampleRecords, { depth: null })
          }

          await tick(90, 'Inserting example records')
          await api.records.insert(sheetId, exampleRecords)

          if (config.debug) {
            logInfo(
              '@flatfile/plugin-import-anthropic',
              `Generated ${exampleRecords.length} example records`
            )
          }

          return {
            info: `Generated ${exampleRecords.length} example records`,
          }
        } catch (error) {
          if (config.debug) {
            logError(
              '@flatfile/plugin-import-anthropic',
              `Error generating example records: ${error.message}`
            )
          }
          throw new Error('Error generating example records')
        }
      })
    )
  }
}
