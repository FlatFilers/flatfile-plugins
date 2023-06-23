import { PsvExtractor } from "./psv.extractor";
import * as path from "path";
import { Flatfile } from "@flatfile/api";
import * as fs from "fs";
import Papa, { ParseResult } from "papaparse";

jest.mock("fs");

describe("PsvParser", function () {
  const parser = new PsvExtractor({
    topic: Flatfile.EventTopic.FileCreated,
    payload: {},
    createdAt: new Date(),
    domain: "space",
    context: {
      fileId: "dev_fl_dZNtPPTa",
      spaceId: "dev_sp_w2TZIUBE",
      accountId: "dev_acc_Iafc9fLm",
      environmentId: "dev_env_rH3SeKkh",
    },
  });

  describe("test-basic.psv", function () {
    beforeEach(() => {
      const buffer = Buffer.from(
        '"Code"|"Details"|"BranchName"|"Tenant"\n"Personal Care"|"Personal Care"|"Department"|"notdata"\n"Home Nursing"|"Home Nursing"|"Department"|"notdata"',
        "utf8"
      );
      jest.spyOn(fs, "readFileSync").mockReturnValue(buffer);
    });

    test("finds the sheet name", () => {
      const capture = parser.parseBuffer(
        '"Code"|"Details"|"BranchName"|"Tenant"\n"Personal Care"|"Personal Care"|"Department"|"notdata"\n"Home Nursing"|"Home Nursing"|"Department"|"notdata"'
      );
      const sheetNames = capture ? Object.keys(capture) : [];
      expect(sheetNames).toEqual(["Sheet1"]);
    });

    test("finds the header names", () => {
      const capture = parser.parseBuffer(
        '"Code"|"Details"|"BranchName"|"Tenant"\n"Personal Care"|"Personal Care"|"Department"|"notdata"\n"Home Nursing"|"Home Nursing"|"Department"|"notdata"'
      );
      const headers =
        capture && capture["Sheet1"] ? capture["Sheet1"].headers : [];
      expect(headers).toHaveLength(4); // Assuming there are 4 headers
    });

    test("finds values", () => {
      const capture = parser.parseBuffer(
        '"Code"|"Details"|"BranchName"|"Tenant"\n"Personal Care"|"Personal Care"|"Department"|"notdata"\n"Home Nursing"|"Home Nursing"|"Department"|"notdata"'
      );
      const data = capture && capture["Sheet1"] ? capture["Sheet1"].data : [];
      expect(data.length).toBeGreaterThan(0); // Assuming there's at least one row
    });
  });
});
