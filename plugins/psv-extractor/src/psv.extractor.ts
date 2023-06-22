import { mapKeys, mapValues } from "remeda";
import {
  AbstractExtractor,
  SheetCapture,
  WorkbookCapture,
} from "./abstract.extractor";
import type { Flatfile } from "@flatfile/api";
import Papa, { ParseResult } from "papaparse";
import * as fs from 'fs';

export class PsvExtractor extends AbstractExtractor {
  private readonly _options: {
    rawNumbers?: boolean;
  };
  constructor(
    public event: Flatfile.UploadCompletedEvent,
    public options?: {
      rawNumbers?: boolean;
    }
  ) {
    super(event);
    this._options = { rawNumbers: false, ...options };
  }

public parseBuffer(fileContents: string): WorkbookCapture {
  try {
    const results = Papa.parse(fileContents, {
      delimiter: "|",
      header: true, // If the first row contains headers
    });

    const parsedData = results.data;

    // Assuming single sheet, name it 'Sheet1'
    return {
      'Sheet1': {
        headers: Object.keys(parsedData[0]),
        data: parsedData,
      },
    };
  } catch (error) {
    // Handle the error
    console.error('An error occurred:', error);
    return null; // Return an appropriate value or throw a custom error if needed
  }
}


  convertSheet(sheet: string): SheetCapture | undefined {
    let parsedSheet = Papa.parse(sheet, {
      delimiter: "|",
      header: true, // If the first row contains headers
    }).data;

    if (!parsedSheet || !parsedSheet.length) {
      console.error('No data found in the sheet');
      return undefined;
    }

    let rows = parsedSheet.slice();
    // use a basic pattern check on the 1st row - should be switched to core header detection
    const hasHeader = this.isHeaderCandidate(rows[0]);

    const colMap: Record<string, string> | null = hasHeader
      ? (rows.shift() as Record<string, string>)
      : null;

    if (colMap) {
      const headers = mapValues(colMap, (val) => val?.replace("*", ""));
      const required = mapValues(colMap, (val) => val?.includes("*"));
      const data = rows.map((row) => mapKeys(row, (key) => headers[String(key)] ?? String(key)));
      return {
        headers: Object.values(headers).filter((v) => v),
        required: mapKeys(required, (k) => headers[String(k)]),
        data,
      };
    } else {
      return { headers: Object.keys(rows[0]), data: rows };
    }
  }

  public async runExtraction(): Promise<boolean> {
    const { data: file } = await this.api.files.get(this.fileId);

    if (file.ext !== "psv") {
      return false;
    }
    const job = await this.startJob();

    try {
      await this.api.jobs.update(job.id, { status: "executing" });
      console.log("about to acknowledge job and download file")
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: "Downloading file",
      });

      const buffer = await this.getFileBufferFromApi(job);
      const fileContents = buffer.toString();

      console.log("about to parse sheets")

      await this.api.jobs.ack(job.id, { progress: 30, info: "Parsing Sheets" });

      const capture = this.parseBuffer(fileContents);

      console.log("about to create workbook")

      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: "Creating Workbook",
      });

      const workbook = await this.createWorkbook(job, file, capture);
      if (!workbook?.sheets) {
        await this.failJob(job, "because no Sheets found.");
        return false;
      }

      console.log("about to add records")

      await this.api.jobs.ack(job.id, {
        progress: 80,
        info: "Adding records to Sheets",
      });

      for (const sheet of workbook.sheets) {
        if (!capture[sheet.name]) {
          continue;
        }
        const recordsData = this.makeAPIRecords(capture[sheet.name]);
        await asyncBatch(
          recordsData,
          async (chunk) => {
            await this.api.records.insert(sheet.id, chunk);
          },
          { chunkSize: 10000, parallel: 1 }
        );
      }
      await this.completeJob(job);
      return true;
    } catch (e) {
      const message = (await this.api.jobs.get(job.id)).data.info
      await this.failJob(job, "while " + message);
      return false;
    }
  }

  isHeaderCandidate(header: Record<string, string | number>): boolean {
    if (!header) {
      return false;
    }

    return !Object.values(header).some((v) =>
      typeof v === "string" ? /^\d+$/.test(v) : !!v
    );
  }
}

async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[]) => Promise<R>,
  options: { chunkSize?: number; parallel?: number } = {}
): Promise<R> {
  const { chunkSize, parallel } = { chunkSize: 1000, parallel: 1, ...options };
  const results: R[] = [];

  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }

  async function processChunk(chunk: T[]): Promise<void> {
    const result = await callback(chunk);
    results.push(result);
  }

  const promises: Promise<void>[] = [];
  let running = 0;
  let currentIndex = 0;

  function processNext(): void {
    if (currentIndex >= chunks.length) {
      return;
    }

    const currentChunk = chunks[currentIndex];
    const promise = processChunk(currentChunk).finally(() => {
      running--;
      processNext();
    });

    promises.push(promise);
    currentIndex++;
    running++;

    if (running < parallel) {
      processNext();
    }
  }

  for (let i = 0; i < parallel && i < chunks.length; i++) {
    processNext();
  }

  await Promise.all(promises);

  return results.flat() as R;
}
