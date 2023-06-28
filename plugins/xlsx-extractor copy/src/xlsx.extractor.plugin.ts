import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";
import { ExcelExtractor } from "./excel.extractor";
import { UploadCompletedEvent } from "@flatfile/api/api";

export const xlsxExtractorPlugin = (options?: { rawNumbers?: boolean }) => {
  return (client: FlatfileListener) => {
    client.on("file:created", (event) => {
      return new ExcelExtractor(
        event as unknown as UploadCompletedEvent,
        options
      ).runExtraction();
    });
  };
};
