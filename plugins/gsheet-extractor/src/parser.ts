import { RecordData } from "@flatfile/api/api";
import { WorkbookCapture } from "@flatfile/util-extractor";
import { google } from "googleapis";

type GsheetFile = {
  doc_id: string;
  resource_key: string; // probably empty
  email: string;
};

const sheets = google.sheets("v4");

export async function parseBuffer(
  buffer: Buffer,
  options: {
    sheetName: string;
    range: string;
    serviceAccount: Record<string, string>;
  },
): Promise<WorkbookCapture> {
  const auth = getAuth(options.serviceAccount);

  const data = JSON.parse(buffer.toString()) as GsheetFile;

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: data.doc_id,
    range: `${options.sheetName}!${options.range}`,
  });

  const headers = response.data.values[0] as string[];

  const values = [] as RecordData[];

  for (const row of response.data.values.slice(1)) {
    const value = {} as RecordData;

    for (let index = 0; index < row.length; index++) {
      // Don't want to save empty headers.
      if (!headers[index]) continue;

      value[headers[index]] = {
        value: row[index],
      };
    }

    values.push(value);
  }

  return {
    [options.sheetName]: {
      headers: response.data.values[0] as string[],
      data: values,
    },
  };
}

function getAuth(serviceAccount: Record<string, string>) {
  return new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}
