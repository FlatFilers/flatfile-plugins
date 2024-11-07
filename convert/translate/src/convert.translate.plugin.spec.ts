import { FlatfileListener } from '@flatfile/listener'
import { Translate } from '@google-cloud/translate/build/src/v2'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  convertTranslatePlugin,
  TranslationConfig,
} from './convert.translate.plugin'

// Mock the @google-cloud/translate module
vi.mock('@google-cloud/translate/build/src/v2', () => {
  return {
    Translate: vi.fn().mockImplementation(() => ({
      translate: vi.fn().mockResolvedValue([['Hola', 'Mundo']]),
    })),
  }
})

describe('convertTranslatePlugin', () => {
  let listener: FlatfileListener
  let config: TranslationConfig

  beforeEach(() => {
    listener = new FlatfileListener()
    config = {
      sourceLanguage: 'en',
      targetLanguage: 'es',
      sheetSlug: 'test-sheet',
      fieldsToTranslate: ['field1', 'field2'],
      projectId: 'test-project',
      keyFilename: 'test-key.json',
    }
  })

  it('should initialize the Google Translate client with correct config', () => {
    convertTranslatePlugin(listener, config)

    expect(Translate).toHaveBeenCalledWith({
      projectId: 'test-project',
      keyFilename: 'test-key.json',
    })
  })

  it('should add a record hook to the listener', () => {
    const useSpy = vi.spyOn(listener, 'use')

    convertTranslatePlugin(listener, config)

    expect(useSpy).toHaveBeenCalledTimes(1)
    expect(useSpy).toHaveBeenCalledWith(expect.any(Function))
  })
})
