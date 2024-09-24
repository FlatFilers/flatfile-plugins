/* 
  Task: Create a field translator Flatfile Listener plugin:
      - Implement a RecordHook to translate specified fields
      - Use a translation API (e.g., Google Translate API) for language conversion
      - Allow configuration of source and target languages
      - Handle batch translation for efficiency
      - Add translated text to new fields in the record
      - Give the user reasonable config options to specify the Sheet Slug, the Field(s) that are the text(s), whether the translation should be done automatically
  _____________________________
  Summary: This code implements a Flatfile Listener plugin for field translation using the Google Translate API. It supports batch translation, configurable options, and both automatic and manual translation workflows. The plugin creates new fields for translated text and includes error handling.
*/

import { recordHook } from '@flatfile/plugin-record-hook'
import {
  FlatfileListener,
  FlatfileEvent,
  FlatfileRecord,
} from '@flatfile/listener'
import { Translate } from '@google-cloud/translate/build/src/v2'

// Configuration options
interface TranslationConfig {
  sourceLanguage: string
  targetLanguage: string
  sheetSlug: string
  fieldsToTranslate: string[]
  autoTranslate: boolean
}

// Initialize the Google Translate client
const translate = new Translate({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: 'path/to/your/keyfile.json',
})

export default function flatfileListenerPlugin(
  listener: FlatfileListener,
  config: TranslationConfig
) {
  listener.use(
    recordHook(
      config.sheetSlug,
      async (record: FlatfileRecord, event: FlatfileEvent) => {
        try {
          // Check if this record is from the configured sheet
          if (event.context.sheetSlug !== config.sheetSlug) {
            return record
          }

          const textsToTranslate = config.fieldsToTranslate
            .map((field) => ({
              text: record.get(field) as string,
              sourceField: field,
              targetField: `${field}_${config.targetLanguage}`,
            }))
            .filter((item) => item.text)

          if (textsToTranslate.length === 0) {
            record.addError('general', 'No text fields to translate')
            return record
          }

          if (config.autoTranslate) {
            const translatedTexts = await batchTranslateText(
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

          return record
        } catch (error) {
          console.error('Error processing record:', error)
          record.addError(
            'general',
            'An error occurred while processing this record'
          )
          return record
        }
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
