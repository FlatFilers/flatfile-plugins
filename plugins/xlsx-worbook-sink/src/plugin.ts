import api, { Flatfile } from "@flatfile/api";
import { FlatfileListener } from "@flatfile/listener";
import { xlsxSinkPlugin } from "../src/index";

/**
 * Some JSDOC here
 */
export const run = () => {};

export const createXlsxWorkbook = () => {
  return (client: FlatfileListener) => {
    client.on("workbook:downloadExcelWorkbook", (event) => {
      return xlsxSinkPlugin();
    });
  };
};

const logError = (msg: string): void => {
  console.error("[@flatfile/plugin-xlsx-workbook-sink]:[FATAL]", msg);
};

const logInfo = (msg: string): void => {
  console.log("[@flatfile/plugin-xlsx-workbook-sink]:[INFO]", msg);
};

const logWarn = (msg: string): void => {
  console.warn("[@flatfile/plugin-xlsx-workbook-sink]:[WARN]", msg);
};
