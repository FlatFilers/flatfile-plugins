import { recordHook } from '@flatfile/plugin-record-hook'
import {
  FlatfileListener,
  FlatfileRecord,
  FlatfileEvent,
} from '@flatfile/listener'
import nspell from 'nspell'
import fs from 'fs'
import path from 'path'

interface SpellCheckConfig {
  fields?: string[]
  dictionaryPath?: string
  affixPath?: string
  language?: string
  sheetSlug?: string
  autoCorrect?: boolean
}

const defaultConfig: SpellCheckConfig = {
  fields: ['name', 'description', 'comments'],
  language: 'en_US',
  sheetSlug: 'mySheetSlug',
  autoCorrect: false,
}

export default function spellCheckPlugin(
  listener: FlatfileListener,
  config: SpellCheckConfig = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  const {
    fields,
    dictionaryPath,
    affixPath,
    language,
    sheetSlug,
    autoCorrect,
  } = finalConfig

  const dicPath =
    dictionaryPath || path.join(__dirname, `dictionaries/${language}.dic`)
  const affPath =
    affixPath || path.join(__dirname, `dictionaries/${language}.aff`)

  const dictionary = fs.readFileSync(dicPath, 'utf-8')
  const affixFile = fs.readFileSync(affPath, 'utf-8')
  const spellChecker = nspell(affixFile, dictionary)

  listener.use(
    recordHook(
      sheetSlug,
      async (record: FlatfileRecord, event: FlatfileEvent) => {
        try {
          await processRecord(record, fields, spellChecker, autoCorrect)
        } catch (error) {
          console.error('Error processing record:', error)
          record.addError(
            'general',
            'An error occurred while processing this record.'
          )
        }
        return record
      },
      {
        concurrency: 5,
        debug: true,
      }
    )
  )
}

async function processRecord(
  record: FlatfileRecord,
  fieldsToCheck: string[],
  spellChecker: nspell.NspellInstance,
  autoCorrect: boolean
): Promise<void> {
  for (const field of fieldsToCheck) {
    const value = record.get(field) as string
    if (value) {
      const words = value.split(/\s+/)
      const misspelledWords: { word: string; index: number }[] = []

      words.forEach((word, index) => {
        if (!spellChecker.correct(word)) {
          misspelledWords.push({ word, index })
        }
      })

      if (misspelledWords.length > 0) {
        const highlightedText = highlightMisspelledWords(value, misspelledWords)
        const suggestions = misspelledWords.map(({ word }) => ({
          word,
          suggestions: spellChecker.suggest(word).slice(0, 3),
        }))

        const correctedText = correctMisspelledWords(value, suggestions)

        record.addWarning(
          field,
          `Possible misspellings found. See highlighted text, suggestions, and corrected text.`
        )
        record.set(`${field}_highlighted`, highlightedText)
        record.set(`${field}_spell_suggestions`, JSON.stringify(suggestions))
        record.set(
          `${field}_misspellings`,
          JSON.stringify(misspelledWords.map((mw) => mw.word))
        )

        if (autoCorrect) {
          record.set(field, correctedText)
          record.addInfo(field, 'Text has been automatically corrected.')
        } else {
          record.set(`${field}_corrected`, correctedText)
        }
      }
    }
  }
}

function highlightMisspelledWords(
  text: string,
  misspelledWords: { word: string; index: number }[]
): string {
  let result = text
  let offset = 0

  misspelledWords.forEach(({ word, index }) => {
    const start = text.indexOf(word, index)
    const end = start + word.length
    const highlightedWord = `<span style="background-color: yellow;">${word}</span>`
    result =
      result.slice(0, start + offset) +
      highlightedWord +
      result.slice(end + offset)
    offset += highlightedWord.length - word.length
  })

  return result
}

function correctMisspelledWords(
  text: string,
  suggestions: { word: string; suggestions: string[] }[]
): string {
  let correctedText = text
  suggestions.forEach(({ word, suggestions }) => {
    if (suggestions.length > 0) {
      const regex = new RegExp(`\\b${word}\\b`, 'g')
      correctedText = correctedText.replace(regex, suggestions[0])
    }
  })
  return correctedText
}
