import { FlatfileEvent } from "@flatfile/listener";
import { FlatfileRecord, FlatfileRecords } from "@flatfile/hooks";
import { Record_, Records } from "@flatfile/api/api";
import { RecordTranslater } from "./record.translater";
import api from "@flatfile/api";

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (record: FlatfileRecord, event: FlatfileEvent) => any | Promise<any>
) => {
  const { sheetId } = event.context;
  try {
    const records = await event.cache.init<Records>(
      "records",
      async () => (await event.data).records
    );
    if (!records) return;

    const batch = await prepareXRecords(records);

    // run client defined data hooks
    for (const x of batch.records) {
      await handler(x, event);
    }

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords();

    // TODO: likely swap this for event.update()
    await event.cache.set("records", async () => recordsUpdates);

    event.afterAll(async () => {
      const records = event.cache.get<Records>("records");
      try {
        return await api.records.update(sheetId, records);
      } catch (e) {
        console.log(`Error putting records: ${e}`);
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
