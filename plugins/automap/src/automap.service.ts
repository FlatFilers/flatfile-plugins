import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { asyncMap } from '@flatfile/common-plugin-utils'
import * as R from 'remeda'
import { AutomapOptions } from './automap.plugin'

type SheetSample = Readonly<{
  sheet: Flatfile.Sheet
  records: Flatfile.RecordsWithLinks
}>

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
      { job: 'workbook:map' },
      (event) => this.handleMappingPlanCreated(event)
    )

    listener.on(
      Flatfile.EventTopic.JobCompleted,
      { job: 'file:extract' },
      (event) => this.handleFileExtraction(event)
    )
  }

  /**
   * Handle file extraction.
   *
   * @param event - Flatfile event
   */
  public async handleFileExtraction(event: FlatfileEvent): Promise<void> {
    const { fileId, spaceId } = event.context

    try {
      const file = await this.getFileById(fileId)

      if (!this.isFileNameMatch(file)) {
        return
      } else {
        await this.updateFileName(file.id, `⚡️ ${file.name}`)
      }

      if (R.isNil(file.workbookId)) {
        if (this.options.debug) {
          this.logError('No Workbook Id found')
        }
        return
      }

      try {
        const { data: workbooks } = await api.workbooks.list({
          spaceId,
        })

        const destinationWorkbook = this.getTargetWorkbook(workbooks)
        if (R.isNil(destinationWorkbook)) {
          if (this.options.debug) {
            this.logError('Unable to determine destination Workbook')
          }
          return
        }

        try {
          const mappings = await this.getMappingJobs(file)
          let destinationSheet: Flatfile.Sheet | undefined
          const jobs = await asyncMap(mappings, async ({ target, source }) => {
            if (R.isNil(target)) return

            destinationSheet = R.pipe(
              destinationWorkbook.sheets,
              R.find(
                (s) =>
                  s.name === target ||
                  s.id === target ||
                  s.config.slug === target
              )
            )

            const destinationSheetId = destinationSheet?.id
            if (R.isNil(destinationSheetId)) return

            try {
              const { data: job } = await api.jobs.create({
                type: 'workbook',
                operation: 'map',
                source: file.workbookId!,
                managed: true,
                destination: destinationWorkbook.id,

                config: {
                  sourceSheetId: source,
                  destinationSheetId,
                },
              })

              return job
            } catch (_jobError: unknown) {
              this.logError('Unable to create mapping job')
              return
            }
          })

          const actualJobs = R.pipe(
            jobs,
            R.reject((j) => R.isNil(j))
          )

          if (R.length(actualJobs) > 0) {
            await this.updateFileName(
              file.id,
              `⚡️ ${file.name} 🔁 ${destinationSheet?.name}`
            )
          }
        } catch (_mappingsError: unknown) {
          this.logError('Unable to fetch mappings')
          return
        }
      } catch (_workbookError: unknown) {
        this.logError('Unable to list workbooks')
        return
      }
    } catch (_fileError: unknown) {
      this.logError(`Unable to fetch file with id: ${fileId}`)
      return
    }
  }

  /**
   * This method selects a target workbook based on the provided set of workbooks and the class options.
   *
   * @param workbooks - The array of workbooks from which to select a target.
   * @returns The selected target workbook or undefined if no suitable workbook could be found.
   */
  private getTargetWorkbook(
    workbooks: Array<Flatfile.Workbook>
  ): Flatfile.Workbook | undefined {
    const { targetWorkbook } = this.options
    const targets = R.pipe(
      workbooks,
      R.reject((w) => w.labels?.includes('file'))
    )

    if (R.length(targets) === 0) {
      return undefined
    } else if (!R.isNil(targetWorkbook)) {
      const target = R.pipe(
        targets,
        R.find((w) => w.id === targetWorkbook || w.name === targetWorkbook)
      )

      if (!R.isNil(target)) return target
    } else if (R.length(targets) === 1) {
      return R.first(targets)
    } else {
      return R.pipe(
        targets,
        R.find((w) => w.labels?.includes('primary'))
      )
    }
  }

  /**
   * Once the initial mapping plan is created, check if our automation rules apply and
   * execute the mapping job if they do.
   *
   * @param event - Flatfile event
   * @private
   */
  private async handleMappingPlanCreated(event: FlatfileEvent): Promise<void> {
    const { jobId } = event.context

    try {
      const {
        data: { plan },
      } = (await api.jobs.getExecutionPlan(jobId)) as any
      // const { plan } = await api.jobs.getExecutionPlan(jobId); // types don't line up... why?

      if (R.isNil(plan)) return

      if (this.options.debug) {
        this.logInfo(`Job Execution Plan:\n${JSON.stringify(plan, null, 2)}`)
      }

      if (R.length((plan as Flatfile.JobExecutionPlan).fieldMapping) === 0) {
        this.logWarn('At least one field must be mapped')

        if (!R.isNil(this.options.onFailure)) {
          this.options.onFailure(event)
        }
        return
      }

      try {
        switch (this.options.accuracy) {
          case 'confident':
            if (this.verifyConfidentMatchingStrategy(plan)) {
              await api.jobs.execute(jobId)
            } else {
              if (this.options.debug) {
                this.logWarn('Skipping automap due to lack of confidence')
              }

              if (!R.isNil(this.options.onFailure)) {
                this.options.onFailure(event)
              }
            }
            break
          case 'exact':
            if (this.verifyAbsoluteMatchingStrategy(plan)) {
              await api.jobs.execute(jobId)
            } else {
              if (this.options.debug) {
                this.logWarn('Skipping automap due to lack of confidence')
              }

              if (!R.isNil(this.options.onFailure)) {
                this.options.onFailure(event)
              }
            }
            break
        }
      } catch (_jobError: unknown) {
        this.logError(`Unable to execute job with id: ${jobId}`)
        return
      }
    } catch (_execPlanError: unknown) {
      this.logError(`Unable to fetch execution plan for job with id: ${jobId}`)
      return
    }
  }

  private async getFileById(fileId: string): Promise<Flatfile.File_> {
    const { data: file } = await api.files.get(fileId)

    return file
  }

  /**
   * Check if the file name matches the configured regex.
   *
   * @param file
   * @private
   */
  private isFileNameMatch(file: Flatfile.File_): boolean {
    const { matchFilename: regex } = this.options

    if (R.isNil(regex)) {
      // allow mapping to continue b/c we weren't explicitly told not to
      return true
    } else {
      if (regex.global) {
        regex.lastIndex = 0
      }
      return regex.test(file.name)
    }
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
    const workbookResponse = await api.workbooks.get(file.workbookId!)
    const sheets = workbookResponse.data.sheets || []
    const { defaultTargetSheet } = this.options

    // if (!R.isNil(this.options.selectSheets)) {
    //   const sample = await this.getRecordSampleForSheets(sheets);

    //   const assignments = await asyncMap(sample, async ({ sheet, records }) => {
    //     const target = await this.options.selectSheets!(records, sheet);

    //     return { source: sheet.id, target };
    //   });

    //   return R.pipe(
    //     assignments,
    //     R.reject(({ target }) => target === false)
    //   );
    // } else
    if (R.length(sheets) === 1 && !R.isNil(defaultTargetSheet)) {
      return [{ source: R.first(sheets).id, target: defaultTargetSheet }]
    } else {
      return []
    }
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
      const response = await api.records.get(sheet.id, { pageSize: 10 })
      const records = response.data.records

      return { sheet, records: records! }
    })
  }

  private verifyAbsoluteMatchingStrategy(
    plan: Flatfile.JobExecutionPlan
  ): boolean {
    return R.pipe(plan, (p) =>
      p.fieldMapping?.every(
        (edge) => edge.metadata?.certainty === Flatfile.Certainty.Absolute
      )
    )
  }

  private verifyConfidentMatchingStrategy(
    plan: Flatfile.JobExecutionPlan
  ): boolean {
    return R.pipe(plan, (p) =>
      p.fieldMapping?.every(
        (edge) =>
          edge.metadata?.certainty === Flatfile.Certainty.Strong ||
          edge.metadata?.certainty === Flatfile.Certainty.Absolute
      )
    )
  }

  private updateFileName(
    fileId: string,
    fileName: string
  ): Promise<Flatfile.FileResponse> {
    return api.files.update(fileId, { name: fileName })
  }

  private logError(msg: string): void {
    console.error('[@flatfile/plugin-automap]:[FATAL] ' + msg)
  }

  private logInfo(msg: string): void {
    console.log('[@flatfile/plugin-automap]:[INFO] ' + msg)
  }

  private logWarn(msg: string): void {
    console.warn('[@flatfile/plugin-automap]:[WARN] ' + msg)
  }
}
