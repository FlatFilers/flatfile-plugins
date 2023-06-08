import { Flatfile, FlatfileClient } from "@flatfile/api";
import { mapValues } from "remeda";

/**
 * This is a universal helper for writing custom file extractors within Flatfile
 */
export class AbstractExtractor {
  /**
   * ID of File being extracted
   */
  public fileId: string;

  /**
   * Convenience reference for API client
   */
  public api: FlatfileClient;

  constructor(public event: Flatfile.UploadCompletedEvent) {
    this.fileId = event.context.fileId || "";
    this.api = new FlatfileClient();
  }

  /**
   * Download file data from Flatfile
   */
  public async getFileBufferFromApi(): Promise<Buffer> {
    const file = await this.api.files.download(this.fileId);

    const chunks = [];
    // node.js readable streams implement the async iterator protocol
    for await (const chunk of file) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  /**
   * Start a job on the API referencing the extraction. This will all reporting completion
   * to the user when the extraction is completed.
   */
  public async startJob(): Promise<Flatfile.Job> {
    try {
      const res = await this.api.jobs.create({
        type: "file",
        operation: "extract",
        status: "executing",
        source: this.fileId,
        // TODO: This should be configurable
        managed: true,
      });
      if (!res || !res.data) {
        throw new Error(`Unable to create job: ${JSON.stringify(res)}`);
      }
      return res.data;
    } catch (e) {
      console.log(`error ${e}`);
      throw e;
    }
  }

  /**
   * Complete a previously started extraction job. This will notify the UI that the extraction
   * is ready.
   *
   * @param job
   */
  public async completeJob(job: Flatfile.Job) {
    try {
      // TODO: Is there a new API endpoint for this?
      const res = await this.api.jobs.update(job.id, {
        status: "complete",
      });
      return res.data;
    } catch (e) {
      console.log(`error ${e}`);
      throw e;
    }
  }

  /**
   * Create workbook on server mactching schema structure and attach to the file
   *
   * @param file
   * @param workbookCapture
   */
  public async createWorkbook(
    file: any,
    workbookCapture: WorkbookCapture
  ): Promise<Flatfile.Workbook> {
    const workbookConfig = this.getWorkbookConfig(
      file.name,
      this.event.context.spaceId!,
      this.event.context.environmentId,
      workbookCapture
    );

    try {
      const workbook = await this.api.workbooks.create(workbookConfig);

      if (!workbook || !workbook.data) {
        throw new Error(
          `Unable to create workbook: ${JSON.stringify(workbook)}`
        );
      }
      await this.api.files.update(file.id, { workbookId: workbook.data?.id });

      return workbook.data;
    } catch (e) {
      console.log(`error ${e}`);
      throw e;
    }
  }

  /**
   * Convert the data from each sheet into created records
   *
   * @todo some verification that rows can't contain non-header data
   * @param sheet
   * @private
   */
  protected makeAPIRecords(sheet: SheetCapture): Flatfile.RecordData[] {
    return sheet.data.map((row: Record<string, any>) => {
      return mapValues(row, (value) => ({ value }));
    });
  }

  /**
   * Get a workbook configuration to post to the API
   *
   * @param name
   * @param spaceId
   * @param environmentId
   * @param workbookCapture
   * @private
   */
  protected getWorkbookConfig(
    name: string,
    spaceId: string,
    environmentId: string,
    workbookCapture: WorkbookCapture
  ): Flatfile.CreateWorkbookConfig {
    const sheets = Object.values(
      mapValues(workbookCapture, (sheet, sheetName) => {
        return this.getSheetConfig(sheetName, sheet);
      })
    );
    return {
      name: `[file] ${name}`,
      labels: ["file"],
      spaceId,
      environmentId,
      sheets,
    };
  }

  /**
   * Construct a sheet configuration for the extracted sheet
   *
   * @param name
   * @param headers
   * @param required
   * @param descriptions
   * @private
   */
  protected getSheetConfig(
    name: string,
    { headers, required, descriptions }: SheetCapture
  ): Flatfile.SheetConfig {
    return {
      name,
      fields: headers.map((key) => ({
        key,
        label: key,
        description: descriptions?.[key] || "",
        type: "string",
        constraints: required?.[key] ? [{ type: "required" }] : [],
      })),
    };
  }
}

/**
 * Generic structure for capturing a workbook
 */
export type WorkbookCapture = Record<string, SheetCapture>;

/**
 * Generic structure for capturing a sheet
 */
export type SheetCapture = {
  headers: string[];
  required?: Record<string, boolean>;
  descriptions?: Record<string, null | string> | null;
  data: Record<string, any>;
};
