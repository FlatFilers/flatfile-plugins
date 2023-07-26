import { recordHook } from "./index";
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from "../../../testing/test.helpers";

describe("recordHook() e2e", () => {
  const listener = setupListener();

  let spaceId;
  let sheetId;

  beforeAll(async () => {
    const space = await setupSpace();
    spaceId = space.id;
    const workbook = await setupSimpleWorkbook(space.id, [
      "name",
      "email",
      "notes",
    ]);
    sheetId = workbook.sheets[0].id;
  });

  afterAll(async () => {
    await deleteSpace(spaceId);
  });

  describe("record created", () => {
    beforeEach(async () => {
      listener.use(recordHook("test", (record) => record.set("name", "daddy")));
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
