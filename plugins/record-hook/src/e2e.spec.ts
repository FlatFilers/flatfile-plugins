import { FlatfileRecord, recordHook } from "./index";
import {
  createRecords,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from "../../../testing/test.helpers";
import { FlatfileEvent } from "@flatfile/listener";

describe("recordHook() e2e", () => {
  const listener = setupListener();

  let sheetId;

  beforeAll(async () => {
    const space = await setupSpace();
    const workbook = await setupSimpleWorkbook(space.id, [
      "name",
      "email",
      "notes",
    ]);
    sheetId = workbook.sheets[0].id;
  });

  describe("record created", () => {
    beforeEach(async () => {
      listener.use(
        recordHook(
          "test",
          <Extra>(
            record: FlatfileRecord,
            _event: FlatfileEvent,
            extra: Extra
          ) => record.set("name", extra["foo"]),
          <Extra>(_event: FlatfileEvent): Extra => {
            return { foo: "daddy" } as Extra;
          }
        )
      );
    });

    it("correctly modifies a value", async () => {
      await createRecords(sheetId, [
        {
          name: "John Doe",
          email: "john@doe.com",
          notes: "foobar",
        },
      ]);

      await listener.waitFor("commit:created");
      const records = await getRecords(sheetId);
      const firstRecord = records[0];
      expect(firstRecord.values["name"]).toMatchObject({ value: "daddy" });
    });
  });
});
