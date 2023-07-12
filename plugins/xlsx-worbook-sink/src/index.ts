import { FlatfileListener } from "@flatfile/listener";

import { PluginOptions, run } from "./plugin";

/**
 * Excel Workbook export plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const xlsxSinkPlugin = (opts: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.filter({ job: "workbook:downloadExcelWorkbook" }, () => {
      listener.on("job:ready", async (event) => {
        await run(event, opts);
      });
    });
  };
};
