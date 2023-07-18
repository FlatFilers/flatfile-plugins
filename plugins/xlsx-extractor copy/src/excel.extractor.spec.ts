import * as fs from "fs";
import { ExcelExtractor } from "./excel.extractor";
import * as path from "path";
import { Flatfile } from "@flatfile/api";

describe("ExcelParser", function () {
  const buffer: Buffer = fs.readFileSync(
    path.join(__dirname, "../ref/test-basic.xlsx")
  );

  const parser = new ExcelExtractor({
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

  describe("test-basic.xlsx", function () {
    test("finds all the sheet names", () => {
      const capture = parser.parseBuffer(buffer);
      expect(Object.keys(capture)).toEqual(["Departments", "Clients"]);
    });

    test("finds the header names", () => {
      const capture = parser.parseBuffer(buffer);
      expect(capture["Departments"].headers).toEqual([
        "Code",
        "Details",
        "BranchName",
        "Tenant",
      ]);
    });

    test("finds values", () => {
      const capture = parser.parseBuffer(buffer);
      expect(capture["Departments"].data.length).toEqual(2);
    });
  });
});
