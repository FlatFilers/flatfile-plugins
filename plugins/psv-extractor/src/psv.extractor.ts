import { AbstractExtractor, WorkbookCapture, SheetCapture } from './abstract.extractor';
import { psv2json } from 'psv2json';
import { mapValues } from "remeda";

export class PsvExtractor extends AbstractExtractor {

  public async runExtraction(): Promise<boolean> {
    const { data: file } = await this.api.files.get(this.fileId);

    if (file.ext !== "psv") {
      return false;
    }
    const job = await this.startJob();

    try {
      // Download the file
      await this.api.jobs.update(job.id, { status: "executing" });
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: "Downloading file",
      });
      console.log("10% Downloading file");
      const buffer = await this.getFileBufferFromApi(job);

      // Parse the file
      await this.api.jobs.ack(job.id, {
        progress: 30,
        info: "Parsing Sheets",
      });
      console.log("30% Parsing Sheets");
      const capture = this.parseBuffer(buffer, file.name);

      // Create the workbook
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

      // Add records
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
      // Complete the job
      await this.completeJob(job);
    } catch (e) {
      await this.failJob(job, e.message);
      throw e;
    }
  }

  protected parseBuffer(buffer: Buffer, fileName: string): WorkbookCapture {
    // Parse the PSV file into JSON.
    const psv = buffer.toString();
    const json = psv2json(psv);

    // Convert the JSON into the workbook capture format.
    const workbookCapture: WorkbookCapture = {};

    // Use the file name as the sheet name
    workbookCapture[fileName] = this.convertSheet(json);

    return workbookCapture;
  }

  protected convertSheet(sheetData: any[]): SheetCapture {
    const headers = Object.keys(sheetData[0]);
    const data = sheetData.map(row => mapValues(row, value => ({ value })));

    return {
      headers,
      data,
      required: headers.reduce((acc, header) => {
        acc[header] = true;
        return acc;
      }, {}),
      descriptions: headers.reduce((acc, header) => {
        acc[header] = '';
        return acc;
      }, {}),
    };
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