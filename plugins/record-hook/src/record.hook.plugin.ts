import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";
import { RecordHook } from "./RecordHook";
import type { FlatfileRecord } from "@flatfile/hooks";

export const recordHookPlugin = (
  sheetSlug: string,
  callback: <T = any>(record: FlatfileRecord, event?: FlatfileEvent, extra?: T) => {},
  setup?: <T = any>(event: FlatfileEvent) => T,
) => {
  return (client: FlatfileListener) => {
    client.on("commit:created", { sheetSlug }, (event: FlatfileEvent) => {
      return RecordHook(event, callback, setup);
    });
  };
};

export { recordHookPlugin as recordHook };
