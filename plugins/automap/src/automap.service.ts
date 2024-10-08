import { Flatfile, FlatfileClient } from '@flatfile/api'
import { asyncMap } from '@flatfile/common-plugin-utils'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import * as R from 'remeda'
import { AutomapOptions } from './automap.plugin'

const api = new FlatfileClient()

export class AutomapService {
  constructor(public readonly options: AutomapOptions) {}

  /**
   * Create listeners for Flatfile to respond to for auto mapping.
   *
   * @param listener - The listener to be assigned.
   */
  public assignListeners(listener: FlatfileListener): void {
    // Listen for job updates to determine when the mapping plan is ready
    // The plan creation is async and we need to wait for it to be ready
    listener.on(
      Flatfile.EventTopic.JobUpdated,
      { job: 'workbook:map' },
      (event) => this.handleMappingPlanUpdated(event)
    )

    listener.on(
      Flatfile.EventTopic.JobCompleted,
      { job: 'file:extract*' },
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
            if (R.isNil(target)) {
              if (this.options.debug) {
                this.logInfo(
                  `Unable to determine destination sheet for source sheet with id: ${source}`
                )
              }
              return
            }

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
                input: {
                  isAutomap: true,
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
   * Once the initial mapping plan is created, wait for the job status = planning, check if our automation rules apply and
   * execute the mapping job if they do.
   *
   * @param event - Flatfile event
   * @private
   */
  private async handleMappingPlanUpdated(event: FlatfileEvent): Promise<void> {
    const { jobId } = event.context

    const job = await api.jobs.get(jobId)

    if (!job.data.input?.isAutomap) {
      if (this.options.debug) {
        this.logInfo(`Not an automap job: ${jobId}`)
      }
      return
    }

    // Plan generation is async, so we need to wait for the job to be in the planning state
    if(job.data.status !== Flatfile.JobStatus.Planning){
      if (this.options.debug) {
        this.logInfo(`Job is not in planning state: ${jobId}. Waiting for future event`)
      }
      return
    }

    try {
      const {
        data: { plan },
      }: Flatfile.JobPlanResponse = await api.jobs.getExecutionPlan(jobId)

      if (R.isNil(plan)) {
        if (this.options.debug) {
          this.logInfo('No job execution plan found')
        }
        return
      }

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
    const targetSheet =
      typeof defaultTargetSheet === 'function'
        ? await defaultTargetSheet(file.name)
        : defaultTargetSheet

    if (R.length(sheets) === 1 && !R.isNil(targetSheet)) {
      return [{ source: R.first(sheets).id, target: targetSheet }]
    } else {
      return []
    }
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
