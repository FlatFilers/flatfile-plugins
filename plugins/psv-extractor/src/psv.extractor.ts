import { AbstractExtractor, WorkbookCapture, SheetCapture } from './abstract.extractor';
import { psv2json } from 'psv2json';
import { mapValues } from "remeda";

export class PsvExtractor extends AbstractExtractor {
  public static supports = ['.psv'];

  public async runExtraction() {
    const job = await this.startJob();

    try {
      // Download the file
      await this.api.jobs.update(job.id, { status: "executing" });
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: "Downloading file",
      });
      console.log("10% Downloading file");
      const fileBuffer = await this.getFileBufferFromApi(job);

      // Parse the file
      await this.api.jobs.ack(job.id, {
        progress: 30,
        info: "Parsing Sheets",
      });
      console.log("30% Parsing Sheets");
      const workbookCapture = this.parseBuffer(fileBuffer, this.fileId);

      // Create the workbook
      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: "Creating Workbook",
      });
      console.log("50% Creating Workbook");
      const workbook = await this.createWorkbook(job, fileBuffer, workbookCapture);

      await this.api.jobs.ack(job.id, {
        progress: 80,
        info: "Adding records to Sheets",
      });
      console.log("80% Adding records to Sheets");

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