import { FlatfileListener } from "@flatfile/listener";

import { PluginOptions, run } from "./plugin";

/**
 * Some JSDOC here...
 */
export const xlsxSinkPlugin = (config: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.filter({ job: "workbook:downloadExcelWorkbook" }, (listener_) => {
      listener_.on("job:ready", async (event) => {
        await run(event, config);
      });
    });
  };
};
