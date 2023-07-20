import { FlatfileEvent } from "@flatfile/listener";
import { FlatfileRecord, FlatfileRecords } from "@flatfile/hooks";
import { Record_, Records } from "@flatfile/api/api";
import { RecordTranslater } from "./record.translater";

export const RecordHook = async (
  event: FlatfileEvent,
  handler: <T = any>(record: FlatfileRecord, event: FlatfileEvent, extra?: T) => any | Promise<any>,
  setup?: <T = any>(event: FlatfileEvent) => T
) => {
  try {
    const extra = setup(event);
    const records = await event.cache.init<Records>(
      "records",
      async () => (await event.data).records
    );
    if (!records) return;

    const batch = await prepareXRecords(records);

    // run client defined data hooks
    for (const x of batch.records) {
      await handler(x, event, extra);
    }

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords();

    await event.cache.set("records", async () => recordsUpdates);

    event.afterAll(async () => {
      const records = event.cache.get<Records>("records");
      try {
        return await event.update(records);
      } catch (e) {
        console.log(`Error updating records: ${e}`);
      }
    });
  } catch (e) {
    console.log(`Error getting records: ${e}`);
  }

  return handler;
};

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const clearedMessages: Record_[] = records.map(
    (record: { values: { [x: string]: { messages: never[] } } }) => {
      // clear existing cell validation messages
      Object.keys(record.values).forEach((k) => {
        record.values[k].messages = [];
      });
      return record;
    }
  );
  const fromX = new RecordTranslater<Record_>(clearedMessages);
  return fromX.toFlatFileRecords();
};
