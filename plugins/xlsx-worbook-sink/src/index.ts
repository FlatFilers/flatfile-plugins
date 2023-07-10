import { FlatfileListener } from "@flatfile/listener";

import { run } from "./plugin";

/**
 * Some JSDOC here...
 */
export const xlsxSinkPlugin = () => {
  return (client: FlatfileListener) => {
    client.on("", (event) => {
      return run();
    });
  };
};
