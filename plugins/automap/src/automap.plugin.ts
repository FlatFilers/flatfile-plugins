import { Flatfile } from "@flatfile/api";
import { FlatfileListener } from "@flatfile/listener";
import { AutomapService } from "./automap.service";

/**
 * Automap plugin for Flatfile.
 *
 * @param options - config options
 */
export function automap(options: AutomapOptions) {
  const automapper = new AutomapService(options);

  return (listener: FlatfileListener): void => {
    automapper.assignListeners(listener);
  };
}

/**
 * Plugin config options.
 *
 * @property {string} accuracy - asdf
 * @property {RegExp} matchFilename - asdf
 * @property {function} selectSheets - asdf
 * @property {string} defaultTargetSheet - asdf
 * @property {string} targetWorkbook - asdf
 */
export interface AutomapOptions {
  readonly accuracy: "exact";
  readonly matchFilename?: RegExp;
  readonly selectSheets?: (
    records: Flatfile.RecordsWithLinks,
    sheet: Flatfile.Sheet
  ) => string | false | Promise<string | false>;
  readonly defaultTargetSheet?: string;
  readonly targetWorkbook?: string;
}
