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
 * @property {string} accuracy - match columns either by 'confident' (>= 80% match) or 'exact' (100% match).
 * @property {RegExp} matchFilename - a regular expression to match specific files to perform automapping on.
 * @property {string} defaultTargetSheet - exact sheet name to import data to
 * @property {string} targetWorkbook - asdf
 */
export interface AutomapOptions {
  readonly accuracy: "confident" | "exact";
  readonly matchFilename?: RegExp;
  readonly defaultTargetSheet?: string;
  readonly targetWorkbook?: string;
}
