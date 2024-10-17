import { recordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { Translate } from '@google-cloud/translate/build/src/v2'

// Configuration options
export interface TranslationConfig {
  sourceLanguage: string
  targetLanguage: string
  sheetSlug: string
  fieldsToTranslate: string[]
  autoTranslate: boolean
  projectId: string
  keyFilename: string
}

// Initialize the Google Translate client
let translate: Translate

export function translateRecord(
  record: FlatfileRecord,
  config: TranslationConfig
): { record: FlatfileRecord; error?: string } {
  try {
    const textsToTranslate = config.fieldsToTranslate
      .map((field) => ({
        text: record.get(field) as string,
        sourceField: field,
        targetField: `${field}_${config.targetLanguage}`,
      }))
      .filter((item) => item.text)

    if (textsToTranslate.length === 0) {
      return { record, error: 'No text fields to translate' }
    }

    if (config.autoTranslate) {
      const translatedTexts = batchTranslateText(
        textsToTranslate.map((item) => item.text),
        config.sourceLanguage,
        config.targetLanguage
      )

      textsToTranslate.forEach((item, index) => {
        record.set(item.targetField, translatedTexts[index])
      })
    } else {
      // If not auto-translating, create empty fields for manual input
      textsToTranslate.forEach((item) => {
        record.set(item.targetField, '')
      })
    }

    return { record }
  } catch (error) {
    console.error('Error processing record:', error)
    return { record, error: 'An error occurred while processing this record' }
  }
}

export function convertTranslatePlugin(
  listener: FlatfileListener,
  config: TranslationConfig
) {
  // Initialize the Google Translate client with the provided configuration
  translate = new Translate({
    projectId: config.projectId,
    keyFilename: config.keyFilename,
  })

  listener.use(
    recordHook(
      config.sheetSlug,
      async (record: FlatfileRecord, event: FlatfileEvent) => {
        // Check if this record is from the configured sheet
        if (event.context.sheetSlug !== config.sheetSlug) {
          return record
        }

        const { record: updatedRecord, error } = translateRecord(record, config)

        if (error) {
          updatedRecord.addError('general', error)
        }

        return updatedRecord
      }
    )
  )
}

async function batchTranslateText(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  try {
    const [translations] = await translate.translate(texts, {
      from: sourceLanguage,
      to: targetLanguage,
    })
    return Array.isArray(translations) ? translations : [translations]
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error('Failed to translate texts')
  }
}

export default convertTranslatePlugin
