import api, { Flatfile } from "@flatfile/api";
import { PubSubDriver } from "@flatfile/listener-driver-pubsub";
import { TestListener } from "./test.listener";
import axios from "axios";

export function getEnvironmentId(): string {
  return process.env.FLATFILE_ENVIRONMENT_ID;
}

export async function setupSpace(): Promise<Flatfile.spaces.Space> {
  const environmentId = getEnvironmentId();

  const { data: space } = await api.spaces.create({
    name: "ci-space-" + Date.now(),
    environmentId,
  });

  return space;
}

export function streamEvents(listener: TestListener) {
  const environmentId = getEnvironmentId();

  const driver = new PubSubDriver(environmentId);

  beforeAll(async () => {
    await driver.start();
    listener.mount(driver);
  });

  afterAll(() => {
    driver.shutdown();
  });
}

export function setupListener(): TestListener {
  const listener = new TestListener();
  streamEvents(listener);
  beforeEach(() => {
    listener.resetCount();
  });

  afterEach(() => {
    listener.reset();
  });
  return listener;
}

export async function setupSimpleWorkbook(
  spaceId: string,
  fields: Array<Flatfile.Property | string>
): Promise<Flatfile.Workbook> {
  const res = await api.workbooks.create({
    name: "ci-wb-" + Date.now(),
    spaceId: spaceId,
    environmentId: getEnvironmentId(),
    sheets: [
      {
        name: "test",
        slug: "test",
        fields: fields.map((field) =>
          typeof field === "string" ? { key: field, type: "string" } : field
        ),
      },
    ],
  });
  return res.data;
}

export async function getRecords(sheetId: string) {
  const {
    data: { records },
  } = await api.records.get(sheetId);
  return records;
}

export async function createRecords(
  sheetId: string,
  records: Array<Record<string, any>>
) {
  await axios.post(
    `https://platform.flatfile.com/api/v1/sheets/${sheetId}/records`,

    records.map((r) =>
      Object.keys(r).reduce((acc, k) => {
        acc[k] = { value: r[k] };
        return acc;
      }, {})
    ),

    {
      headers: {
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
        "X-Force-Hooks": "true",
      },
    }
  );
}
