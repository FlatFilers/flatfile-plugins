import { mapKeys, mapValues } from "remeda";
import {
  AbstractExtractor,
  SheetCapture,
  WorkbookCapture,
} from "./abstract.extractor";
import type { Flatfile } from "@flatfile/api";
import Papa, { ParseResult } from "papaparse";
import * as fs from "fs";

export class PsvExtractor extends AbstractExtractor {
  private readonly _options: {
    //add if needed
  };

  constructor(
    public event: Flatfile.UploadCompletedEvent,
    public options?: {
      //add if needed
    }
  ) {
    super(event);
    this._options = { ...options };
  }

  public parseBuffer(fileContents: string): WorkbookCapture {
    try {
      if (!fileContents) {
        console.log("Invalid file contents");
        return undefined;
      }

      const results: ParseResult<Record<string, string>> = Papa.parse(
        fileContents,
        {
          delimiter: "|",
          header: true,
        }
      );

      const parsedData = results.data;

      if (!parsedData || !parsedData.length) {
        console.log("No data found in the file");
        return undefined;
      }

      const sheetName = "Sheet1"; // Set the sheet name

      return {
        [sheetName]: {
          headers: Object.keys(parsedData[0]),
          data: parsedData,
        },
      };
    } catch (error) {
      console.log("An error occurred:", error);
      throw error;
    }
  }

  convertSheet(sheet: string): SheetCapture | undefined {
    try {
      if (!sheet) {
        console.log("Invalid sheet data");
        return undefined;
      }

      const parsedSheet: ParseResult<Record<string, string>> = Papa.parse(
        sheet,
        {
          delimiter: "|",
          header: true,
        }
      );

      if (!parsedSheet.data || !parsedSheet.data.length) {
        console.log("No data found in the sheet");
        return undefined;
      }

      const rows = parsedSheet.data;
      const hasHeader = this.isHeaderCandidate(rows[0]);

      const colMap: Record<string, string> | null = hasHeader
        ? (rows.shift() as Record<string, string>)
        : null;

      if (colMap) {
        const headers = Object.values(colMap)
          .map((val) => val?.replace("*", ""))
          .filter(Boolean);
        const required = Object.fromEntries(
          Object.entries(colMap).map(([key, val]) => [
            headers.find((h) => colMap[h] === val),
            val?.includes("*"),
          ])
        );
        const data = rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, val]) => [
              headers.find((h) => colMap[h] === key) || key,
              val,
            ])
          )
        );

        return {
          headers,
          required,
          data,
        };
      } else {
        return { headers: Object.keys(rows[0]), data: rows };
      }
    } catch (error) {
      console.log("An error occurred:", error);
      throw error;
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
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: "Downloading file",
      });

      const buffer = await this.getFileBufferFromApi(job);
      const fileContents = buffer.toString();

      await this.api.jobs.ack(job.id, { progress: 30, info: "Parsing Sheets" });

      const capture = this.parseBuffer(fileContents);

      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: "Creating Workbook",
      });

      const workbook = await this.createWorkbook(job, file, capture);
      if (!workbook?.sheets) {
        await this.failJob(job, "because no Sheets found.");
        return false;
      }

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
      const message = (await this.api.jobs.get(job.id)).data.info;
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
