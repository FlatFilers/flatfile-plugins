import { Extractor } from "./extractor";
import { parseBuffer } from "./parser";

type Config = {
  sheetRange?: string;
}

/**
 * Plugin config options.
 *
 * @property {string} sheetRange - use if you need a custom subset of columns + rows (example C4:Z)
 */
export interface GsheetExtractorOptions {
  readonly sheetRange?: string
}

export const GSheetExtractor = (options: GsheetExtractorOptions) => {
  return Extractor(/\.gsheet$/i, parseBuffer, options);
};
