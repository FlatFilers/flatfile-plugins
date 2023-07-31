import { Flatfile } from "@flatfile/api";
import { faker } from "@faker-js/faker";

import { keepFirst$prime, keepLast$prime } from "./plugin";

interface Context {
  records: Flatfile.RecordsWithLinks;
}

describe("Dedupe", () => {
  const context: Context = {
    records: Array.from(
      { length: 5 },
      (_val, idx): Flatfile.RecordWithLinks => ({
        id: `recordId:${idx}`,
        values: {
          firstName: faker.lorem.word() as any,
          lastName: faker.lorem.word() as any,
          email: `${faker.internet.email()}` as any,
        },
        valid: true,
        messages: [],
      })
    ),
  };

  it("keepFirst()", () => {
    const removeThese = keepFirst$prime(context.records, (r1, r2) => {
      return r1.values["email"] === r2.values["email"];
    });

    expect(removeThese).toEqual(["recordId:1", "recordId:2"]);
  });

  it("keepLast()", () => {
    const removeThese = keepLast$prime(context.records, (r1, r2) => {
      return r1.values["email"] === r2.values["email"];
    });

    expect(removeThese).toEqual(["recordId:1", "recordId:2"]);
  });

  it("custom()", () => {});
});
