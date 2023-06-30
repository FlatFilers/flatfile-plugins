import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";
import { RecordHook } from "./RecordHook";
import type { FlatfileRecord } from "@flatfile/hooks";
import api  from "@flatfile/api"

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (record: FlatfileRecord, event?: FlatfileEvent) => {}
) => {
  return (client: FlatfileListener) => {
    client.on("commit:created", { sheetSlug }, (event: FlatfileEvent) => {
      const sheet = api.sheets.get(event.context.sheetId);
      return RecordHook(event, callback);
    });
  };
};

export { recordHookPlugin as recordHook };
