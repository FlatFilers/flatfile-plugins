import { recordHook } from "./index";
import api from "@flatfile/api";
import { FlatfileListener } from "@flatfile/listener";
import { PubSubDriver } from "@flatfile/listener-driver-pubsub";
import axios from "axios";
process.env.FLATFILE_API_KEY = "sk_zYPCesnPeogrb9n6HsDtLrtoWDsTRQxA";
process.env.FLATFILE_BEARER_TOKEN = "sk_zYPCesnPeogrb9n6HsDtLrtoWDsTRQxA";
process.env.AGENT_INTERNAL_URL = "https://platform.flatfile.com/api";
class TestListener extends FlatfileListener {
  invocations = 0;

  async dispatchEvent(event: any): Promise<void> {
    this.invocations++;
    await super.dispatchEvent(event);
    this.invocationWatchers.forEach(([count, resolver]) => {
      // todo, add event filter etc.
      if (count <= this.invocations) {
        resolver();
      }
    });
  }

  private invocationWatchers = [];

  wasInvoked(count: number = 1): Promise<number> {
    // todo: add timeout here
    return new Promise((resolve) => {
      this.invocationWatchers.push([count, resolve]);
    });
  }
  resetCount() {
    this.invocations = 0;
  }

  reset() {
    // @ts-ignore
    this.listeners = [];
    this.invocations = 0;
    // @ts-ignore
    this.nodes.forEach((n) => n.reset());
  }
}

jest.setTimeout(10_000);
describe("recordHook() e2e", () => {
  const testListener = new TestListener();

  let workbook;
  let driver;
  beforeAll(async () => {
    // const { data: environment } = await api.environments.create({
    //   name: "ci-env-" + Date.now(),
    //   isProd: false,
    // });
    // @ts-ignore
    const { data: environment } = await api.environments.get("current");
    driver = new PubSubDriver(environment.id);
    await driver.start();
    testListener.mount(driver);
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    const { data: space } = await api.spaces.create({
      name: "ci-space-" + Date.now(),
      environmentId: environment.id,
    });
    const wbData = await api.workbooks.create({
      name: "ci-wb-" + Date.now(),
      spaceId: space.id,
      environmentId: environment.id,
      sheets: [
        {
          name: "test",
          slug: "test",
          fields: [
            { type: "string", key: "name" },
            { type: "string", key: "email" },
            { type: "string", key: "notes" },
          ],
        },
      ],
    });
    workbook = wbData.data;
  });

  beforeEach(() => {
    testListener.resetCount();
  });

  afterEach(() => {
    testListener.reset();
  });

  describe("record created", () => {
    let sheetId;
    beforeEach(async () => {
      testListener.use(
        recordHook("test", (record) => {
          record.set("name", "daddy");
          // do something here
          return record;
        })
      );
      const { data: sheets } = await api.sheets.list({
        workbookId: workbook.id,
      });
      sheetId = sheets[0].id;
      await axios.post(
        `https://platform.flatfile.com/api/v1/sheets/${sheetId}/records`,

        [
          {
            name: { value: "John Doe" },
            email: { value: "john@doe.com" },
            notes: { value: "foobar" },
          },
        ],

        {
          headers: {
            Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
            "X-Force-Hooks": "true",
          },
        }
      );
    });
    test("record hooks run", async () => {
      await testListener.wasInvoked(1);
      const {
        data: { records },
      } = await api.records.get(sheetId);
      const firstRecord = records[0];
      expect(firstRecord.values["name"]).toMatchObject({ value: "daddy" });
    });
  });

  afterEach(() => {
    // delete records
  });
});
