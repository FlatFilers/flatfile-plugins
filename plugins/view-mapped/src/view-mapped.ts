import { type Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'

const api = new FlatfileClient()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface ViewMappedOptions {
  /**
   * If true, the plugin will skip removal of required fields
   */
  keepRequiredFields?: boolean
}

/**
 * This plugin allows you to make the post-mapping sheet only display mapped data
 */
export function viewMappedPlugin(options: ViewMappedOptions) {
  return (listener: FlatfileListener) => {
    // Defining what needs to be done when Flatfile is done mapping columns based on user input during the Mapping stage of the import process
    listener.on('job:completed', { job: 'workbook:map' }, async (event) => {
      const { jobId } = event.context

      // Obtaining the mapping job's execution plan to later extract "fieldMapping" out of it, which tells us which fields were mapped in the Matching step
      const jobPlan = await api.jobs.getExecutionPlan(jobId)

      const destinationSheetId = (
        jobPlan.data.job.config as Flatfile.MappingProgramJobConfig
      ).destinationSheetId

      // Creating a custom job that we will use in the next listener to ensure users only see mapped fields in the table
      await api.jobs.create({
        // We are creating a sheet level job so that the record counts will recompute
        type: 'sheet',
        operation: 'viewMappedFieldsOnly',
        source: destinationSheetId,
        // This ensures that our custom job will execute automatically when the "job:ready" event of the listener below triggers
        trigger: 'immediate',
        // This ensures that users are not able to interact with records in the table until it is updated to only show mapped fields
        mode: 'foreground',
        // This ensures that in the next listener we are able to access the jobId of the mapping job specifically, and not just the jobId of this custom job
        input: { mappingJobId: jobId },
      })
    })

    // Defining what needs to be done when our custom job triggers. Because we create it when mapping job completes, this is when this job will begin executing
    listener.use(
      jobHandler('sheet:viewMappedFieldsOnly', async (event, tick) => {
        const { jobId, workbookId } = event.context

        try {
          // First, we acknowledge the job
          await tick(10, 'plugins.viewMapped.updatingTable')

          // Retrieving the info on the custom job we created in the listener above, and storing that info in its own "customJobInfo" variable
          const customJobInfo = await api.jobs.get(jobId)

          // From "customJobInfo" variable, retrieving the jobId specifically of the mapping job that completed, and storing it in its own "mappingJobId" variable
          const mappingJobId = customJobInfo.data.input.mappingJobId

          // Obtaining the mapping job's execution plan to later extract "fieldMapping" out of it, which tells us which fields were mapped in the Matching step
          const jobPlan = await api.jobs.getExecutionPlan(mappingJobId)

          const destinationSheetId = (
            jobPlan.data.job.config as Flatfile.MappingProgramJobConfig
          ).destinationSheetId

          // Initializing an empty array to store the keys of the mapped fields
          const mappedFields = []

          // Iterating through all destination fields that are mapped and extracting their field keys. Then, pushing keys of mapped fields to the "mappedFields" variable
          for (let i = 0; i < jobPlan.data.plan.fieldMapping.length; i++) {
            const destinationFieldKey =
              jobPlan.data.plan.fieldMapping[i].destinationField.key

            mappedFields.push(destinationFieldKey)
          }

          await tick(30, 'plugins.viewMapped.updatingTable')

          // Making an API call to only get the "data" property out of the response, and saving it as its own "fetchedWorkbook" variable
          // We need to make this API call and cannot just use what's inside of "workbookOne" because we need data in a specific format
          const { data: workbook } = await api.workbooks.get(workbookId)

          // If trackChanges is not enabled, we skip the rest of the job. This configuration is required to provide the plugins with the
          // awareness that all hooks have run. Without it, we run into a race condition between the hook and the Workbook update. If the
          // Workbook update runs before the hook, the hook will not be able to update the Workbook.
          if (!workbook.settings?.trackChanges) {
            console.log('Skipping because trackChanges is not enabled')
            return
          }

          // Looping through all sheets of the Workbook One. For all fields that are mapped, updating those fields' metadata to "{mapped: true}"
          workbook.sheets.forEach((sheet) => {
            if (sheet.id === destinationSheetId) {
              sheet.config.fields.forEach((field) => {
                if (mappedFields.includes(field.key)) {
                  field.metadata = { mapped: true }
                }
              })
            }
          })

          // Looping over each sheet in "workbook" and filtering for fields with metadata "mapped: true". Saving mapped fields per each sheet inside of "filteredWorkbookFields" varibable
          const filteredWorkbookFields = workbook.sheets.map((sheet) => {
            const fields = sheet.config.fields.filter((field) => {
              // Keep mapped fields
              if (field.metadata?.mapped === true) return true

              // Handle required fields based on keepRequiredFields option
              const isRequired = field.constraints?.some(
                (constraint) => constraint.type === 'required'
              )
              return options.keepRequiredFields && isRequired
            })
            return fields.length > 0 ? fields : null
          })

          await tick(50, 'plugins.viewMapped.halfway')

          const sheets = workbook.sheets.map((sheet, index) => {
            const mappedWorkbookFields = filteredWorkbookFields[index]

            // If there are no mapped fields, returning the original sheet structure
            if (!mappedWorkbookFields) {
              return sheet
            }

            // If there are mapped fields, returning all properties of the original sheet but updating the "fields" property to the mapped fields
            return {
              ...sheet,
              config: {
                ...sheet.config,
                fields: mappedWorkbookFields,
              },
            }
          })

          await tick(80, 'plugins.viewMapped.almostDone')

          // Check that all commits are completed before running this job
          let hasUncompletedCommits = true
          do {
            const { data: commits } = await api.sheets.getSheetCommits(
              destinationSheetId,
              {
                completed: false,
              }
            )
            console.log(`Waiting on ${commits.length} commits to complete...`)
            hasUncompletedCommits = commits.length > 0
            if (hasUncompletedCommits) {
              // We wait for 200ms between each check to avoid making too many requests to the API
              await sleep(200)
            }
          } while (hasUncompletedCommits)
          // For good measure, sleep for 300ms to ensure that the workbook is updated before the next job is run
          await sleep(300)

          // Updating each sheet in a workbook to only contain fields that a user mapped. This ensures that when the table with data loads, only mapped fields will be displayed
          await api.workbooks.update(workbookId, {
            // Keeping other non-sheet elements of the workbook untouched (Workbook name, its Submit action, etc)
            ...workbook,

            // Mapping over each sheet to update each to only contain fields that are inside of "filteredWorkbookFields" variable (that have metadata "{mapped: true})"
            sheets,
          })

          // Completing the job with an appropriate message to the user
          return {
            outcome: {
              message: 'plugins.viewMapped.complete',
              acknowledge: false,
            },
          }
        } catch (error) {
          // If something goes wrong while executing the custom job, we fail the job with a message on what next steps to take
          logError(
            '@flatfile/plugin-view-mapped',
            JSON.stringify(error, null, 2)
          )
          throw new Error('plugins.viewMapped.error')
        }
      })
    )
  }
}
