import * as XLSX from "xlsx";
import { mapKeys, mapValues } from "remeda";
import { AbstractExtractor, SheetCapture } from "./abstract.extractor";
import type { Flatfile } from "@flatfile/api";

export class ExcelExtractor extends AbstractExtractor {
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
  /**
   * Parse a file buffer into a captured sheet
   *
   * @param buffer
   */
  public parseBuffer(buffer: Buffer): Record<string, SheetCapture> {
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    return mapValues(workbook.Sheets, (value, key) => {
      return this.convertSheet(value);
    });
  }

  /**
   * Convert a template sheet using a special template format
   *
   * @param sheet
   */
  convertSheet(sheet: XLSX.WorkSheet): SheetCapture {
    let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      header: "A",
      defval: null,
      rawNumbers: this._options.rawNumbers || false,
    });

    // use a basic pattern check on the 1st row - should be switched to core header detection
    const hasHeader = this.isHeaderCandidate(rows[0]);

    const colMap: Record<string, string> | null = hasHeader
      ? (rows.shift() as Record<string, string>)
      : null;

    if (colMap) {
      const headers = mapValues(colMap, (val) => val?.replace("*", ""));
      const required = mapValues(colMap, (val) => val?.includes("*"));
      const data = rows.map((row) => mapKeys(row, (key) => headers[key]));
      return {
        headers: Object.values(headers).filter((v) => v),
        required: mapKeys(required, (k) => headers[k]),
        data,
      };
    } else {
      return { headers: Object.keys(rows[0]), data: rows };
    }
  }

  /**
   * Extract the data from an uploaded XLSX file
   */
  public async runExtraction(): Promise<boolean> {
    const { data: file } = await this.api.files.get(this.fileId);

    if (file.ext !== "xlsx") {
      return false;
    }
    const job = await this.startJob();

    try {
      //set status for getFileBuffer()
      await this.api.jobs.update(job.id, {
        status: "executing",
      });

      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: "Downloading file",
      });
      console.log("10% Downloading file");

      const buffer = await this.getFileBufferFromApi(job);

      //set status for parseBuffer()
      await this.api.jobs.ack(job.id, {
        progress: 30,
        info: "Parsing Sheets",
      });
      console.log("30% Parsing Sheets");

      const capture = this.parseBuffer(buffer);

      //set status for createWorkbook()
      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: "Creating Workbook",
      });
      console.log("50% Creating Workbook");

      const workbook = await this.createWorkbook(job, file, capture);
      if (!workbook?.sheets) {
        await this.failJob(job, "because no Sheets found.");
        return false;
      }

      //set status for adding records
      await this.api.jobs.ack(job.id, {
        progress: 80,
        info: "Adding records to Sheets",
      });
      console.log("80% Adding records to Sheets");

      for (const sheet of workbook.sheets) {
        if (!capture[sheet.name]) {
          continue;
        }
        const recordsData = this.makeAPIRecords(capture[sheet.name]);
        await asyncBatch(recordsData, async (chunk) => {
          await this.api.records.insert(sheet.id, chunk);
        }, { chunkSize: 10000, parallel: 1 });
      }
      await this.completeJob(job);
      return true;
    } catch (e) {
      await this.failJob(job, "while adding Records to Sheets.");
      return false;
    }
  }

  /**
   * This needs to be improved but right now it looks for a pattern unlikely
   * to be in a header.
   *
   * Yes header | foo | bar | baz |
   * No header  | 99  | asd | 0   |
   *
   * @param header
   */
  isHeaderCandidate(header: Record<string, string | number>): boolean {
    if (!header) {
      return false;
    }

    // rule out anything that contains a pure number or non-string
    return !Object.values(header).some((v) =>
      typeof v === "string" ? /^[0-9]+$/.test(v) : !!v
    );
  }
}

async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[]) => Promise<R>,
  options: { chunkSize?: number; parallel?: number } = {}
): Promise<R> {
  const { chunkSize, parallel } = { chunkSize: 1000, parallel: 1, ...options }
  const results: R[] = []

  // Split the array into chunks
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }

  // Create a helper function to process a chunk
  async function processChunk(chunk: T[]): Promise<void> {
    const result = await callback(chunk)
    results.push(result)
  }

  // Execute the chunks in parallel
  const promises: Promise<void>[] = []
  let running = 0
  let currentIndex = 0

  function processNext(): void {
    if (currentIndex >= chunks.length) {
      // All chunks have been processed
      return
    }

    const currentChunk = chunks[currentIndex]
    const promise = processChunk(currentChunk).finally(() => {
      running--
      processNext() // Process next chunk
    })

    promises.push(promise)
    currentIndex++
    running++

    if (running < parallel) {
      processNext() // Process another chunk if available
    }
  }

  // Start processing the chunks
  for (let i = 0; i < parallel && i < chunks.length; i++) {
    processNext()
  }

  // Wait for all promises to resolve
  await Promise.all(promises)

  return results.flat() as R
}