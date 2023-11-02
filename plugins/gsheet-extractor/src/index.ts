import { Extractor } from "./extractor";
import { parseBuffer } from "./parser";

export const GSheetExtractor = (options?: {
  sheetName: string;
  range: string;
}) => {
  return Extractor(/\.gsheet$/i, parseBuffer, options);
};
