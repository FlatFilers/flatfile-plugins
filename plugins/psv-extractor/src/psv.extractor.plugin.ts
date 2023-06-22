import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";
import { psvExtractor } from "./psv.extractor";
import { UploadCompletedEvent } from "@flatfile/api/api";

export const psvExtractorPlugin = () => {
  return (client: FlatfileListener) => {
    client.on("file:created", (event) => {
      return new psvExtractor(
        event as unknown as UploadCompletedEvent,
      ).runExtraction();
    });
  };
};
