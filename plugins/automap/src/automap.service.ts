import { Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { logError, logInfo, logWarn } from '@flatfile/util-common'
import { asyncMap } from 'modern-async'
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
      } else if (!this.options.disableFileNameUpdate) {
        await this.updateFileName(file.id, `⚡️ ${file.name}`)
      }

      if (this.isNil(file.workbookId)) {
        if (this.options.debug) {
          logError('@flatfile/plugin-automap', 'No Workbook Id found')
        }
        return
      }

      try {
        const { data: workbooks } = await api.workbooks.list({
          spaceId,
        })

        const destinationWorkbook = this.getTargetWorkbook(workbooks)
        if (this.isNil(destinationWorkbook)) {
          if (this.options.debug) {
            logError(
              '@flatfile/plugin-automap',
              'Unable to determine destination Workbook'
            )
          }
          return
        }

        try {
          const mappings = await this.getMappingJobs(file)
          let destinationSheet: Flatfile.Sheet | undefined
          const jobs = await asyncMap(mappings, async ({ target, source }) => {
            if (this.isNil(target)) {
              if (this.options.debug) {
                logInfo(
                  '@flatfile/plugin-automap',
                  `Unable to determine destination sheet for source sheet with id: ${source}`
                )
              }
              return
            }

            destinationSheet = destinationWorkbook.sheets.find(
              (s) =>
                s.name === target || s.id === target || s.config.slug === target
            )

            const destinationSheetId = destinationSheet?.id
            if (this.isNil(destinationSheetId)) {
              if (this.options.debug) {
                logError(
                  '@flatfile/plugin-automap',
                  'Unable to determine destination sheet'
                )
              }
              return
            }

            try {
              console.log(`[AUTOMAP DEBUG] Creating job for source: ${source}, target: ${target}, destinationSheetId: ${destinationSheetId}`)
              const { data: job } = await api.jobs.create({
                type: 'workbook',
                operation: 'map',
                source: file.workbookId,
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

              console.log(`[AUTOMAP DEBUG] Job created successfully: ${job.id}, status: ${job.status}`)
              return job
            } catch (_jobError: unknown) {
              logError(
                '@flatfile/plugin-automap',
                'Unable to create mapping job'
              )
              return
            }
          })

          const actualJobs = jobs.filter((j) => !this.isNil(j))

          if (actualJobs.length > 0 && !this.options.disableFileNameUpdate) {
            await this.updateFileName(
              file.id,
              `⚡️ ${file.name} 🔁 ${destinationSheet?.name}`
            )
          }
        } catch (_mappingsError: unknown) {
          logError('@flatfile/plugin-automap', 'Unable to fetch mappings')
          return
        }
      } catch (_workbookError: unknown) {
        logError('@flatfile/plugin-automap', 'Unable to list workbooks')
        return
      }
    } catch (_fileError: unknown) {
      logError(
        '@flatfile/plugin-automap',
        `Unable to fetch file with id: ${fileId}`
      )
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
    const targets = workbooks.filter((w) => !w.labels?.includes('file'))

    if (targets.length === 0) {
      if (this.options.debug) {
        logError(
          '@flatfile/plugin-automap',
          'No workbooks found, skipping automap'
        )
      }
      return undefined
    } else if (!this.isNil(targetWorkbook)) {
      const target = targets.find(
        (w) => w.id === targetWorkbook || w.name === targetWorkbook
      )

      if (!this.isNil(target)) return target
    } else if (targets.length === 1) {
      return targets[0]
    } else {
      return targets.find((w) => w.labels?.includes('primary'))
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

    console.log(`[AUTOMAP DEBUG] handleMappingPlanUpdated called for job: ${jobId}`)
    const job = await api.jobs.get(jobId)
    console.log(`[AUTOMAP DEBUG] Job status: ${job.data.status}, isAutomap: ${job.data.input?.isAutomap}`)

    if (!job.data.input?.isAutomap) {
      console.log(`[AUTOMAP DEBUG] Not an automap job: ${jobId}`)
      if (this.options.debug) {
        logInfo('@flatfile/plugin-automap', `Not an automap job: ${jobId}`)
      }
      return
    }

    // Plan generation is async, so we need to wait for the job to be in the planning state
    if (job.data.status !== Flatfile.JobStatus.Planning) {
      console.log(`[AUTOMAP DEBUG] Job not in planning state: ${jobId}, status: ${job.data.status}`)
      if (this.options.debug) {
        logInfo(
          '@flatfile/plugin-automap',
          `Job is not in planning state: ${jobId}. Waiting for future event`
        )
      }
      return
    }

    try {
      const {
        data: { plan },
      }: Flatfile.JobPlanResponse = await api.jobs.getExecutionPlan(jobId)

      if (this.isNil(plan)) {
        if (this.options.debug) {
          logInfo('@flatfile/plugin-automap', 'No job execution plan found')
        }
        return
      }

      if (this.options.debug) {
        logInfo(
          '@flatfile/plugin-automap',
          `Job Execution Plan:\n${JSON.stringify(plan, null, 2)}`
        )
      }

      if ((plan as Flatfile.JobExecutionPlan).fieldMapping.length === 0) {
        logWarn('@flatfile/plugin-automap', 'At least one field must be mapped')

        if (!this.isNil(this.options.onFailure)) {
          await this.options.onFailure(event)
        }
        return
      }

      try {
        console.log(`[AUTOMAP DEBUG] Starting job execution with accuracy: ${this.options.accuracy}`)
        switch (this.options.accuracy) {
          case 'confident':
            console.log(`[AUTOMAP DEBUG] Verifying confident matching strategy for job: ${jobId}`)
            if (this.verifyConfidentMatchingStrategy(plan)) {
              console.log(`[AUTOMAP DEBUG] Confident strategy verified, executing job: ${jobId}`)
              await api.jobs.execute(jobId)
              console.log(`[AUTOMAP DEBUG] Job execution completed for: ${jobId}`)
            } else {
              console.log(`[AUTOMAP DEBUG] Confident strategy failed, skipping execution for job: ${jobId}`)
              if (this.options.debug) {
                logWarn(
                  '@flatfile/plugin-automap',
                  'Skipping automap due to lack of confidence'
                )
              }

              if (!this.isNil(this.options.onFailure)) {
                await this.options.onFailure(event)
              }
            }
            break
          case 'exact':
            console.log(`[AUTOMAP DEBUG] Verifying absolute matching strategy for job: ${jobId}`)
            if (this.verifyAbsoluteMatchingStrategy(plan)) {
              console.log(`[AUTOMAP DEBUG] Absolute strategy verified, executing job: ${jobId}`)
              await api.jobs.execute(jobId)
              console.log(`[AUTOMAP DEBUG] Job execution completed for: ${jobId}`)
            } else {
              console.log(`[AUTOMAP DEBUG] Absolute strategy failed, skipping execution for job: ${jobId}`)
              if (this.options.debug) {
                logWarn(
                  '@flatfile/plugin-automap',
                  'Skipping automap due to lack of confidence'
                )
              }

              if (!this.isNil(this.options.onFailure)) {
                await this.options.onFailure(event)
              }
            }
            break
        }
      } catch (_jobError: unknown) {
        console.log(`[AUTOMAP DEBUG] Job execution failed for: ${jobId}`, _jobError)
        logError(
          '@flatfile/plugin-automap',
          `Unable to execute job with id: ${jobId}`
        )
        return
      }
    } catch (_execPlanError: unknown) {
      logError(
        '@flatfile/plugin-automap',
        `Unable to fetch execution plan for job with id: ${jobId}`
      )
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

    if (this.isNil(regex)) {
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
    
    console.log(`[AUTOMAP DEBUG] getMappingJobs - file.name: ${file.name}, sheets.length: ${sheets.length}`)
    console.log(`[AUTOMAP DEBUG] defaultTargetSheet type: ${typeof defaultTargetSheet}`)
    
    const targetSheet =
      typeof defaultTargetSheet === 'function'
        ? await defaultTargetSheet(file.name)
        : defaultTargetSheet

    console.log(`[AUTOMAP DEBUG] resolved targetSheet: ${targetSheet}`)

    if (sheets.length === 1 && !this.isNil(targetSheet)) {
      console.log(`[AUTOMAP DEBUG] Returning mapping: source=${sheets[0].id}, target=${targetSheet}`)
      return [{ source: sheets[0].id, target: targetSheet }]
    } else {
      console.log(`[AUTOMAP DEBUG] No mapping created - sheets.length: ${sheets.length}, targetSheet: ${targetSheet}`)
      if (this.options.debug) {
        logWarn(
          '@flatfile/plugin-automap',
          'Unable to determine mapping between source and destination sheets, skipping automap'
        )
      }
      return []
    }
  }

  private verifyAbsoluteMatchingStrategy(
    plan: Flatfile.JobExecutionPlan
  ): boolean {
    return (
      plan.fieldMapping?.every(
        (edge) => edge.metadata?.certainty === Flatfile.Certainty.Absolute
      ) ?? false
    )
  }

  private verifyConfidentMatchingStrategy(
    plan: Flatfile.JobExecutionPlan
  ): boolean {
    return (
      plan.fieldMapping?.every(
        (edge) =>
          edge.metadata?.certainty === Flatfile.Certainty.Strong ||
          edge.metadata?.certainty === Flatfile.Certainty.Absolute
      ) ?? false
    )
  }

  private updateFileName(
    fileId: string,
    fileName: string
  ): Promise<Flatfile.FileResponse> {
    return api.files.update(fileId, { name: fileName })
  }

  private isNil(value: any): value is null | undefined {
    return value === null || value === undefined
  }
}
