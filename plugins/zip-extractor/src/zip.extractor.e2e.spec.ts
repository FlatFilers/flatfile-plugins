import api from "@flatfile/api";
import * as fs from "fs";
import * as path from "path";
import {
  getEnvironmentId,
  getFiles,
  setupListener,
  setupSpace,
} from "../../../testing/test.helpers";
import { zipExtractorPlugin } from ".";

describe("ZipExtractor e2e", () => {
  const listener = setupListener();

  let spaceId;

  beforeAll(async () => {
    const space = await setupSpace();
    spaceId = space.id;
    zipExtractorPlugin()(listener);
  });

  describe("test-basic.zip", () => {
    jest.mock("fs");
    test("files extracted an uploaded to space", async () => {
      const files = await getFiles();
      expect(files.length).toBe(20);

      const stream = fs.createReadStream(
        path.join(__dirname, "../ref/getting-started-flat.zip")
      );
      await api.files.upload(stream, {
        spaceId,
        environmentId: getEnvironmentId(),
      });

      const filesPostUpload = await getFiles();
      expect(filesPostUpload.length).toBe(24);
    });
  });
});
