import api, { Flatfile } from "@flatfile/api";
import fs from "fs";
import path from "path";
import { automap } from "./automap.plugin";
import {
  getEnvironmentId,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from "../../../testing/test.helpers";

jest.setTimeout(15_000);

describe("automap() e2e", () => {
  const listener = setupListener();

  let sheetId;
  let spaceId;

  beforeAll(async () => {
    const space = await setupSpace();
    spaceId = space.id;
    const workbook = await setupSimpleWorkbook(spaceId, [
      "name",
      "email",
      "notes",
    ]);
    sheetId = workbook.sheets[0].id;
  });

  afterAll(async () => {
    await api.spaces.delete(spaceId);
  });

  describe("record created", () => {
    const mockFn = jest.fn();

    beforeEach(async () => {
      const stream = fs.createReadStream(path.join(__dirname, "../test.csv"));

      await api.files.upload(stream, {
        spaceId,
        environmentId: getEnvironmentId(),
      });

      listener.use(
        automap({
          accuracy: "confident",
          matchFilename: /test.csv$/g,
          defaultTargetSheet: "test",
        })
      );

      listener.on(
        Flatfile.EventTopic.JobCompleted,
        { job: "workbook:map" },
        (event) => {
          mockFn(event.context.jobId);
        }
      );
    });

    it("correctly modifies a value", () => {
      listener.waitFor(Flatfile.EventTopic.JobCompleted, 2).then(() => {
        expect(mockFn).toHaveBeenCalled()
      })
    });
  });
});
