import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { AutomapService } from './automap.service'

/**
 * Automap plugin for Flatfile.
 *
 * @param options - config options
 */
export function automap(options: AutomapOptions) {
  const optionsDefaulted = defaultOptions(options)
  const automapper = new AutomapService(optionsDefaulted)

  return (listener: FlatfileListener): void => {
    automapper.assignListeners(listener)
  }
}

/**
 * Plugin config options.
 *
 * @property {string} accuracy - match columns either by 'confident' (> 90% match) or 'exact' (100% match).
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 * @property {string} defaultTargetSheet - exact sheet name to import data to.
 * @property {RegExp} matchFilename - a regular expression to match specific files to perform automapping on.
 * @property {string} allColumnsMustBeMapped - specify if all columns must be mapped. Values: 'none', 'both', 'only-source', 'only-target'.
 * @property {Function} onSuccess - callback to be executed when plugin succeeds.
 * @property {Function} onFailure - callback to be executed when plugin fails.
 * @property {string} targetWorkbook - specify destination Workbook id or name.
 * @property {boolean} disableFileNameUpdate - disable filename update on automap.
 * @property {boolean} disableFileNameUpdateOnSuccess - disable filename update on success.
 * @property {boolean} disableFileNameUpdateOnFailure - disable filename update on failure.
 * @property {string} filenameOnCheck - filename on check mapping. Can use {{fileName}}.
 * @property {string} filenameOnStart - filename on start mapping. Can use {{fileName}}, {{destinationSheetName}}.
 * @property {string} filenameOnSuccess - filename on success mapping. Can use {{fileName}}, {{destinationSheetName}}.
 * @property {string} filenameOnFailure - filename on failure mapping. Can use {{fileName}}.
 */
export interface AutomapOptions {
  readonly accuracy: 'confident' | 'exact'
  readonly debug?: boolean
  readonly defaultTargetSheet?:
    | string
    | ((fileName?: string, event?: FlatfileEvent) => string | Promise<string>)
  readonly matchFilename?: RegExp
  readonly allColumnsMustBeMapped?:
    | 'none'
    | 'both'
    | 'only-source'
    | 'only-target'
  readonly onSuccess?: (event: FlatfileEvent) => void
  readonly onFailure?: (event: FlatfileEvent) => void
  readonly targetWorkbook?: string
  readonly disableFileNameUpdate?: boolean
  readonly disableFileNameUpdateOnSuccess?: boolean
  readonly disableFileNameUpdateOnFailure?: boolean
  readonly filenameOnCheck?: string
  readonly filenameOnStart?: string
  readonly filenameOnSuccess?: string
  readonly filenameOnFailure?: string
}

export function defaultOptions(options: AutomapOptions): AutomapOptions {
  const defaultedOptions = {
    ...options,
    accuracy: options.accuracy || 'confident',
    allColumnsMustBeMapped: options.allColumnsMustBeMapped || 'none',
    filenameOnCheck: options.filenameOnCheck || '⚡️ {{fileName}}',
    filenameOnStart:
      options.filenameOnStart || '⚡️ {{fileName}} 🔁 {{destinationSheetName}}',
    filenameOnSuccess:
      options.filenameOnSuccess ||
      '⚡️ {{fileName}} 🔁 {{destinationSheetName}}',
    filenameOnFailure:
      options.filenameOnFailure ||
      '⚡️ {{fileName}} 🔁 {{destinationSheetName}}',
  }

  if (!defaultedOptions.filenameOnCheck.includes('{{fileName}}')) {
    defaultedOptions.filenameOnCheck =
      defaultedOptions.filenameOnCheck + ' {{fileName}}'
  }

  if (!defaultedOptions.filenameOnStart.includes('{{fileName}}')) {
    defaultedOptions.filenameOnStart =
      defaultedOptions.filenameOnStart + ' {{fileName}}'
  }

  if (!defaultedOptions.filenameOnSuccess.includes('{{fileName}}')) {
    defaultedOptions.filenameOnSuccess =
      defaultedOptions.filenameOnSuccess + ' {{fileName}}'
  }

  if (!defaultedOptions.filenameOnFailure.includes('{{fileName}}')) {
    defaultedOptions.filenameOnFailure =
      defaultedOptions.filenameOnFailure + ' {{fileName}}'
  }

  return defaultedOptions
}
