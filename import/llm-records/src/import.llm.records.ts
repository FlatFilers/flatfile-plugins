import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError, logInfo } from '@flatfile/util-common'
import { generateRecords } from './generate.records'

const api = new FlatfileClient()

export interface PluginConfig {
  llmSecretName: string
  model:
    | 'gpt-4o'
    | 'gpt-4-turbo'
    | 'gpt-4'
    | 'gpt-3.5-turbo'
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
    | 'mistral-large-latest'
    | 'mistral-small-latest'
  job: string
  numberOfRecords: number
  debug?: boolean
}

export function importLLMRecords(config: PluginConfig) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(`sheet:${config.job}`, async (event: FlatfileEvent, tick) => {
        const { sheetId } = event.context
        const llmApiKey = await event.secrets(config.llmSecretName)

        if (!llmApiKey) {
          logError(
            '@flatfile/plugin-import-llm-records',
            'LLM API key is not set'
          )
          throw new Error('LLM API key is not set')
        }

        try {
          await tick(30, 'Getting sheet config')
          const { data: sheet } = await api.sheets.get(sheetId)

          await tick(60, 'Generating example records')
          const records = await generateRecords(
            config.model,
            llmApiKey,
            sheet,
            config.numberOfRecords,
            config.debug
          )

          if (config.debug) {
            console.dir(records, { depth: null })
          }

          await tick(90, 'Inserting example records')
          await api.records.insert(sheetId, records)

          if (config.debug) {
            logInfo(
              '@flatfile/plugin-import-llm-records',
              `Generated ${records.length} example records`
            )
          }

          return {
            info: `Generated ${records.length} example records`,
          }
        } catch (error) {
          if (config.debug) {
            logError(
              '@flatfile/plugin-import-llm-records',
              `Error generating example records: ${(error as Error).message}`
            )
          }
          throw new Error('Error generating example records')
        }
      })
    )
  }
}
