import api, { Flatfile } from "@flatfile/api";
import { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
import { asyncMap } from "@flatfile/common-plugin-utils";
import * as R from "remeda";
import { AutomapOptions } from "./automap.plugin";

type SheetSample = Readonly<{
  sheet: Flatfile.Sheet;
  records: Flatfile.RecordsWithLinks;
}>;

export class AutomapService {
  constructor(public readonly options: AutomapOptions) {}

  /**
   * Create listeners for Flatfile to respond to for auto mapping.
   *
   * @param listener - The listener to be assigned.
   */
  public assignListeners(listener: FlatfileListener): void {
    listener.on(
      Flatfile.EventTopic.JobCreated,
      { job: "workbook:map" },
      (event) => this.handleMappingPlanCreated(event)
    );

    listener.on(
      Flatfile.EventTopic.JobCompleted,
      { job: "file:extract" },
      (event) => this.handleFileExtraction(event)
    );
  }

  /**
   * Handle file extraction.
   *
   * @param event - Flatfile event
   */
  public async handleFileExtraction(event: FlatfileEvent): Promise<void> {
    const { fileId, spaceId } = event.context;

    const file = await this.getFileById(fileId);

    if (!this.isFileNameMatch(file)) {
      await this.updateFileName(file.id, `⏸️️ ${file.name}`);
      return;
    }

    await this.updateFileName(file.id, `⚡️ ${file.name}`);
    if (!file.workbookId) {
      return;
    }

    const { data: workbooks } = await api.workbooks.list({
      spaceId,
    });

    const destinationWorkbook = this.getTargetWorkbook(workbooks);

    if (!destinationWorkbook) {
      return;
    }

    const mappings = await this.getMappingJobs(file);
    let destinationSheet: Flatfile.Sheet | undefined;
    const jobs = await asyncMap(mappings, async ({ target, source }) => {
      if (!target) {
        return;
      }

      destinationSheet = destinationWorkbook.sheets?.find(
        (s) => s.name === target || s.id === target
      );

      const destinationSheetId = destinationSheet?.id;
      if (!destinationSheetId) {
        return;
      }

      const { data: job } = await api.jobs.create({
        type: "workbook",
        operation: "map",
        source: file.workbookId!,
        managed: true,
        destination: destinationWorkbook.id,
        config: {
          sourceSheetId: source,
          destinationSheetId,
        },
      });

      return job;
    });

    const actualJobs = jobs.filter((j) => j);

    if (actualJobs.length) {
      await this.updateFileName(
        file.id,
        `⚡️ ${file.name} 🔁 ${destinationSheet?.name}`
      );
    }
  }

  /**
   * This method selects a target workbook based on the provided set of workbooks and the class options.
   *
   * It first filters out any workbooks that have a "file" label.
   * If no such workbooks remain, it returns undefined.
   *
   * Next, it checks the `targetWorkbook` option. If it is set, it attempts to find a workbook with a matching id or name.
   *
   * If the `targetWorkbook` option is not set and there's only one workbook, that workbook is selected as the target.
   *
   * If there's more than one workbook and no target has been found yet, it looks for a workbook with a "primary" label and selects it as the target.
   *
   * If no suitable target workbook can be found following these rules, it returns undefined.
   *
   * @param workbooks - The array of workbooks from which to select a target.
   * @returns The selected target workbook or undefined if no suitable workbook could be found.
   */
  private getTargetWorkbook(
    workbooks: Array<Flatfile.Workbook>
  ): Flatfile.Workbook | undefined {
    const targets = workbooks.filter((w) => !w.labels?.includes("file"));

    if (targets.length === 0) {
      return undefined;
    }

    if (this.options.targetWorkbook) {
      const target = targets.find(
        (w) =>
          w.id === this.options.targetWorkbook ||
          w.name === this.options.targetWorkbook
      );

      if (target) return target;
    }

    if (targets.length === 1) {
      return targets[0];
    }

    return targets.find((w) => w.labels?.includes("primary"));
  }

  /**
   * Once the initial mapping plan is created, check if our automation rules apply and
   * execute the mapping job if they do.
   *
   * @param event - Flatfile event
   * @private
   */
  private async handleMappingPlanCreated(event: FlatfileEvent): Promise<void> {
    const { jobId } = event.context;

     const {
       data: { plan },
     } = (await api.jobs.getExecutionPlan(jobId)) as any;
//    const { plan } = await api.jobs.getExecutionPlan(jobId); // types don't line up... why?

    if (!R.isNil(plan) && this.verifyAbsoluteMatchingStrategy(plan)) {
      await api.jobs.execute(jobId);
    }
  }

  private async getFileById(fileId: string): Promise<Flatfile.File_> {
    const { data: file } = await api.files.get(fileId);

    return file;
  }

  /**
   * Check if the file name matches the configured regex.
   *
   * @param file
   * @private
   */
  private isFileNameMatch(file: Flatfile.File_): boolean {
    if (!this.options.matchFilename) {
      return true;
    }

    return this.options.matchFilename.test(file.name);
  }

  /**
   * Attempts to create a mapping for each sheet in the provided file. The mapping is created
   * based on a sample of the records in each sheet and a selection function (`this.options.selectSheets`).
   *
   * If `this.options.selectSheets` is not defined, it will attempt to create a default mapping
   * if there's only one sheet in the file and a `this.options.defaultTargetSheet` is defined.
   *
   * @param  file - The file from which sheets are retrieved for creating mappings.
   * @returns A promise that resolves to an array of mappings.
   *          Each mapping is an object with a 'source' (the sheet id) and a 'target' (the result from
   *          `this.options.selectSheets` or `this.options.defaultTargetSheet`).
   * @private
   */
  private async getMappingJobs(
    file: Flatfile.File_
  ): Promise<Array<{ source: string; target: string | boolean }>> {
    // Get the workbook related to the file.
    const workbookResponse = await api.workbooks.get(file.workbookId!);
    const sheets = workbookResponse.data.sheets || [];

    // If a function for selecting sheets is defined, use it to create mappings.
    if (this.options.selectSheets) {
      const sample = await this.getRecordSampleForSheets(sheets);

      const assignments = await asyncMap(sample, async ({ sheet, records }) => {
        const target = await this.options.selectSheets!(records, sheet);

        return { source: sheet.id, target };
      });

      // Filter out any assignments that did not have a target.
      return assignments.filter(({ target }) => target !== false) as Array<{
        source: string;
        target: string | boolean;
      }>;
    }
    // If no selectSheets function is defined, but there's only one sheet in the workbook and a defaultTargetSheet is defined, create a default mapping.
    else if (sheets.length === 1 && this.options.defaultTargetSheet) {
      return [
        { source: sheets[0].id, target: this.options.defaultTargetSheet },
      ];
    }

    return [];
  }

  /**
   * This method retrieves a sample of records from the API for each sheet provided in the 'sheets' array.
   * The sample size for each sheet is determined by the 'pageSize' parameter in the API request (currently set to 10).
   *
   * Each resulting sample is then combined with its respective sheet into an object,
   * forming a 'SheetSample' which comprises the sheet information and its corresponding records.
   * This operation is done for each sheet concurrently using the 'asyncMap' function.
   *
   * @param sheets - The list of sheets for which record samples are to be fetched.
   * @returns A promise that resolves to an array of 'SheetSample' objects.
   *
   * @private
   */
  private async getRecordSampleForSheets(
    sheets: ReadonlyArray<Flatfile.Sheet>
  ): Promise<ReadonlyArray<SheetSample>> {
    return asyncMap(sheets, async (sheet) => {
      const response = await api.records.get(sheet.id, { pageSize: 10 });
      const records = response.data.records;

      return { sheet, records: records! };
    });
  }

  private verifyAbsoluteMatchingStrategy(
    plan: Flatfile.JobExecutionPlan
  ): boolean {
    return (
      plan.fieldMapping?.every(
        (e: any) =>
          e.metadata?.certainty === "strong" && e.metadata?.source === "exact"
      ) && this.options.accuracy === "exact"
    );
  }

  private updateFileName(
    fileId: string,
    fileName: string
  ): Promise<Flatfile.FileResponse> {
    return api.files.update(fileId, { name: fileName });
  }
}
