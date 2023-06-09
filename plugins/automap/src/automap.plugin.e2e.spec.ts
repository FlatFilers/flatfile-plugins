import {
  getEnvironmentId,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from "../../../testing/test.helpers";
import { automap } from "./automap.plugin";
import api from "@flatfile/api";
import fs from "fs";
import path from "path";

jest.setTimeout(15_000);
describe("automap() e2e", () => {
  const listener = setupListener();

  let sheetId;
  let spaceId;

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

  describe("record created", () => {
    const fn = jest.fn();
    beforeEach(async () => {
      const stream = fs.createReadStream(path.join(__dirname, "../test.csv"));
      await api.files.upload(stream, {
        spaceId,
        environmentId: getEnvironmentId(),
      });
      listener.use(
        automap({
          accuracy: "exact",
          matchFilename: /test.csv$/g,
          defaultTargetSheet: "test",
        })
      );
      listener.on("job:completed", { job: "workbook:map" }, (e) => {
        fn(e.context.jobId);
      });
    });

    it("correctly modifies a value", async () => {
      await listener.waitFor("job:completed", 2);
      expect(fn).toHaveBeenCalled();
    });
  });
});
