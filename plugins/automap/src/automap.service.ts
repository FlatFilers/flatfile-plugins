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
      } else {
        await this.updateFileName('check', file.id)
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

          if (actualJobs.length > 0) {
            await this.updateFileName('start', file.id, destinationSheet?.name)
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

    const job = await api.jobs.get(jobId)
    const workbook = await api.workbooks.get(job.data.destination)
    const sheet = workbook.data.sheets.find(
      (s) => s.slug === this.options.defaultTargetSheet
    )
    const sheetName = sheet?.name

    if (!job.data.input?.isAutomap) {
      if (this.options.debug) {
        logInfo('@flatfile/plugin-automap', `Not an automap job: ${jobId}`)
      }
      return
    }

    // Plan generation is async, so we need to wait for the job to be in the planning state
    if (job.data.status !== Flatfile.JobStatus.Planning) {
      if (this.options.debug) {
        logInfo(
          '@flatfile/plugin-automap',
          `Job is not in planning state: ${jobId}. Waiting for future event`
        )
      }
      return
    }

    //Get file
    const sourceWorkbook = await api.workbooks.get(job.data.source)
    const files = await api.files.list({ spaceId: sourceWorkbook.data.spaceId })
    const file = files.data.find((f) => f.workbookId === sourceWorkbook.data.id)

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
          this.options.onFailure(event)
        }
        return
      }

      try {
        if (this.verifyMappedColumns(plan)) {
          switch (this.options.accuracy) {
            case 'confident':
              if (this.verifyConfidentMatchingStrategy(plan)) {
                await api.jobs.execute(jobId)

                await this.updateFileName('success', file.id, sheetName)

                if (!this.isNil(this.options.onSuccess)) {
                  this.options.onSuccess(event)
                }
              } else {
                if (this.options.debug) {
                  logWarn(
                    '@flatfile/plugin-automap',
                    'Skipping automap due to lack of confidence'
                  )
                }

                await this.updateFileName('failure', file.id, sheetName)

                if (!this.isNil(this.options.onFailure)) {
                  this.options.onFailure(event)
                }
              }
              break
            case 'exact':
              if (this.verifyAbsoluteMatchingStrategy(plan)) {
                await api.jobs.execute(jobId)

                await this.updateFileName('success', file.id, sheetName)

                if (!this.isNil(this.options.onSuccess)) {
                  this.options.onSuccess(event)
                }
              } else {
                if (this.options.debug) {
                  logWarn(
                    '@flatfile/plugin-automap',
                    'Skipping automap due to lack of confidence'
                  )
                }

                await this.updateFileName('failure', file.id, sheetName)

                if (!this.isNil(this.options.onFailure)) {
                  this.options.onFailure(event)
                }
              }
              break
          }
        } else {
          if (this.options.debug) {
            logWarn(
              '@flatfile/plugin-automap',
              'Skipping automap due to lack of confidence'
            )
          }

          await this.updateFileName('failure', file.id, sheetName)

          if (!this.isNil(this.options.onFailure)) {
            this.options.onFailure(event)
          }
        }
      } catch (_jobError: unknown) {
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
    const targetSheet =
      typeof defaultTargetSheet === 'function'
        ? await defaultTargetSheet(file.name)
        : defaultTargetSheet

    if (sheets.length === 1 && !this.isNil(targetSheet)) {
      return [{ source: sheets[0].id, target: targetSheet }]
    } else {
      if (this.options.debug) {
        logWarn(
          '@flatfile/plugin-automap',
          'Unable to determine mapping between source and destination sheets, skipping automap'
        )
      }
      return []
    }
  }

  private verifyMappedColumns(plan: Flatfile.JobExecutionPlan): boolean {
    let mappedColumnsVerified = false

    if (this.options.allColumnsMustBeMapped === 'none') {
      mappedColumnsVerified = true
    }
    if (
      this.options.allColumnsMustBeMapped === 'both' &&
      plan.unmappedDestinationFields?.length === 0 &&
      plan.unmappedSourceFields?.length === 0
    ) {
      mappedColumnsVerified = true
    }
    if (
      this.options.allColumnsMustBeMapped === 'only-source' &&
      plan.unmappedSourceFields?.length === 0
    ) {
      mappedColumnsVerified = true
    }
    if (
      this.options.allColumnsMustBeMapped === 'only-target' &&
      plan.unmappedDestinationFields?.length === 0
    ) {
      mappedColumnsVerified = true
    }

    return mappedColumnsVerified
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

  private async updateFileName(
    stage: 'manual' | 'check' | 'start' | 'success' | 'failure',
    fileId: string,
    destinationSheetName?: string
  ): Promise<Flatfile.FileResponse | void> {
    const file = await api.files.get(fileId)
    const currentFileName = file.data.name
    let newFileName = ''
    if (this.options.disableFileNameUpdate) {
      return
    }

    if (stage === 'check') {
      newFileName = this.resolveVariablesInFileName(
        this.options.filenameOnCheck,
        { fileName: currentFileName }
      )
      return api.files.update(fileId, { name: newFileName })
    }

    if (stage === 'start') {
      const oldFileName = await this.getFileNameFromOldFileName(
        this.options.filenameOnCheck,
        currentFileName
      )
      newFileName = this.resolveVariablesInFileName(
        this.options.filenameOnStart,
        { fileName: oldFileName, destinationSheetName: destinationSheetName }
      )
      return api.files.update(fileId, { name: newFileName })
    }

    if (stage === 'success' && !this.options.disableFileNameUpdateOnSuccess) {
      const oldFileName = await this.getFileNameFromOldFileName(
        this.options.filenameOnStart,
        currentFileName
      )
      newFileName = this.resolveVariablesInFileName(
        this.options.filenameOnSuccess,
        { fileName: oldFileName, destinationSheetName: destinationSheetName }
      )
      return api.files.update(fileId, { name: newFileName })
    }

    if (stage === 'failure' && !this.options.disableFileNameUpdateOnFailure) {
      const oldFileName = await this.getFileNameFromOldFileName(
        this.options.filenameOnStart,
        currentFileName
      )
      newFileName = this.resolveVariablesInFileName(
        this.options.filenameOnFailure,
        { fileName: oldFileName, destinationSheetName: destinationSheetName }
      )
      return api.files.update(fileId, { name: newFileName })
    }

    return
  }

  private isNil(value: any): value is null | undefined {
    return value === null || value === undefined
  }

  private resolveVariablesInFileName(
    fileName: string,
    variables: { destinationSheetName?: string; fileName?: string }
  ): string {
    if (variables.destinationSheetName) {
      fileName = fileName.replace(
        '{{destinationSheetName}}',
        variables.destinationSheetName
      )
    }
    if (variables.fileName) {
      fileName = fileName.replace('{{fileName}}', variables.fileName)
    }
    return fileName
  }

  private async getFileNameFromOldFileName(
    pattern: string,
    filename: string
  ): Promise<string> {
    try {
      // Find the position of {{fileName}} in the pattern
      const fileNameMatch = pattern.match(/{{fileName}}/)
      if (!fileNameMatch) {
        return filename
      }

      // Get the text before and after {{fileName}}
      const beforePattern = pattern.substring(0, fileNameMatch.index)
      const afterPattern = pattern.substring(
        fileNameMatch.index + '{{fileName}}'.length
      )

      // Escape special characters in the before/after patterns
      const beforeRegex = this.escapeRegExp(beforePattern)
      const afterRegex = this.escapeRegExp(afterPattern).replace(
        this.escapeRegExp('{{destinationSheetName}}'),
        '.*?'
      )

      // Create a safe regex pattern that matches the exact structure
      const safeRegex = new RegExp(`^${beforeRegex}(.*?)${afterRegex}$`)

      // Add timeout protection
      const MAX_EXECUTION_TIME = 100
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Regex timeout')), MAX_EXECUTION_TIME)
      })

      const matchPromise = new Promise<string>((resolve) => {
        const match = filename.match(safeRegex)
        if (match?.[1]) {
          resolve(match[1].trim())
        } else {
          resolve(filename)
        }
      })

      return Promise.race([matchPromise, timeoutPromise])
        .then((result) => result)
        .catch(() => filename)
    } catch (error) {
      return filename
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
