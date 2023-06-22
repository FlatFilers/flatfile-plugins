import * as fs from "fs";
import { PsvExtractor } from "./psv.extractor";
import * as path from "path";
import { Flatfile } from "@flatfile/api";

describe("PsvParser", function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, "../ref/test-basic.psv")
  );

  const parser = new PsvExtractor({
    topic: Flatfile.EventTopic.FileCreated,
    payload: {} as Record<string, unknown>,
    createdAt: new Date(),
    domain: "space",
    name: "upload:completed",
    id: "dev_ev_45sTvU0GMMNwXmZP",
    context: {
      fileId: "dev_fl_dZNtPPTa",
      spaceId: "dev_sp_w2TZIUBE",
      accountId: "dev_acc_Iafc9fLm",
      environmentId: "dev_env_rH3SeKkh",
    } as any,
    api: {} as any,
  } as Flatfile.UploadCompletedEvent);

  describe("test-basic.psv", function () {
    test("finds the sheet name", () => {
      const capture = this.parseBuffer(buffer.toString("utf8"));
      expect(Object.keys(capture)).toEqual(["Sheet1"]);
    });

    test("finds the header names", () => {
      const capture = this.parseBuffer(buffer.toString("utf8"));
      expect(capture["Sheet1"].headers).toHaveLength(4); // Assuming there are 4 headers
    });

    test("finds values", () => {
      const capture = this.parseBuffer(buffer.toString("utf8"));
      expect(capture["Sheet1"].data.length).toBeGreaterThan(0); // Assuming there's at least one row
    });
  });
});
