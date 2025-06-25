import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { AutomapService } from './automap.service'

/**
 * Automap plugin for Flatfile.
 *
 * @param options - config options
 */
export function automap(options: AutomapOptions) {
  const automapper = new AutomapService(options)

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
 * @property {Function} onFailure - callback to be executed when plugin bails. Can be sync or async.
 * @property {string} targetWorkbook - specify destination Workbook id or name.
 */
export interface AutomapOptions {
  readonly accuracy: 'confident' | 'exact'
  readonly debug?: boolean
  readonly defaultTargetSheet?:
    | string
    | ((fileName?: string, event?: FlatfileEvent) => string | Promise<string>)
  readonly matchFilename?: RegExp
  readonly onFailure?: (event: FlatfileEvent) => void | Promise<void>
  readonly targetWorkbook?: string
  readonly disableFileNameUpdate?: boolean
}
