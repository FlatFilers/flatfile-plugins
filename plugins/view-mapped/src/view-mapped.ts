import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'

import { FlatfileClient } from '@flatfile/api'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'

const api = new FlatfileClient()

/**
 * This plugin allows you to make the post-mapping sheet only display mapped data
 */
export function viewMappedPlugin() {
  return (listener: FlatfileListener) => {
    // Defining what needs to be done when Flatfile is done mapping columns based on user input during the Mapping stage of the import process
    listener.on(
      'job:completed',
      { job: 'workbook:map' },
      async ({ context: { jobId, workbookId } }) => {
        // Creating a custom job that we will use in the next listener to ensure users only see mapped fields in the table
        await api.jobs.create({
          type: 'workbook',
          operation: 'viewMappedFieldsOnly',
          source: workbookId,
          // This ensures that our custom job will execute automatically when the "job:ready" event of the listener below triggers
          trigger: 'immediate',
          // This ensures that users are not able to interact with records in the table until it is updated to only show mapped fields
          mode: 'foreground',
          // This ensures that in the next listener we are able to access the jobId of the mapping job specifically, and not just the jobId of this custom job
          input: { mappingJobId: jobId },
        })
      }
    )

    // Defining what needs to be done when our custom job triggers. Because we create it when mapping job completes, this is when this job will begin executing
    listener.use(
      jobHandler(
        'workbook:viewMappedFieldsOnly',
        async (
          event: FlatfileEvent,
          tick: (percentage: number, message: string) => Promise<void>
        ) => {
          const { jobId, workbookId } = event.context

          try {
            // First, we acknowledge the job
            await tick(10, 'Updating the table to only view mapped fields')

            // Retrieving the info on the custom job we created in the listener above, and storing that info in its own "customJobInfo" variable
            const customJobInfo = await api.jobs.get(jobId)

            // From "customJobInfo" variable, retrieving the jobId specifically of the mapping job that completed, and storing it in its own "mappingJobId" variable
            const mappingJobId = customJobInfo.data.input?.mappingJobId

            // Obtaining the mapping job's execution plan to later extract "fieldMapping" out of it, which tells us which fields were mapped in the Matching step
            const jobPlan = await api.jobs.getExecutionPlan(mappingJobId)

            // Initializing an empty array to store the keys of the mapped fields
            const mappedFields: string[] = []

            // Iterating through all destination fields that are mapped and extracting their field keys. Then, pushing keys of mapped fields to the "mappedFields" variable
            for (let i = 0; i < jobPlan.data.plan.fieldMapping.length; i++) {
              const destinationFieldKey =
                jobPlan.data.plan.fieldMapping[i]!.destinationField.key

              mappedFields.push(destinationFieldKey)
            }

            await tick(30, 'Updating the table to only view mapped fields')

            // Making an API call to only get the "data" property out of the response, and saving it as its own "fetchedWorkbook" variable
            // We need to make this API call and cannot just use what's inside of "workbookOne" because we need data in a specific format
            const { data: workbook } = await api.workbooks.get(workbookId)

            // Looping through all sheets of the Workbook One. For all fields that are mapped, updating those fields' metadata to "{mapped: true}"
            workbook.sheets?.forEach((sheet: Flatfile.Sheet) => {
              sheet.config.fields.forEach((field) => {
                if (mappedFields.includes(field.key)) {
                  field.metadata = { mapped: true }
                }
              })
            })

            // Looping over each sheet in "workbook" and filtering for fields with metadata "mapped: true". Saving mapped fields per each sheet inside of "filteredWorkbookFields" varibable
            const filteredWorkbookFields = workbook.sheets?.map(
              (sheet: Flatfile.Sheet) => {
                const fields = sheet.config.fields.filter(
                  (field) => field.metadata && field.metadata.mapped === true
                )
                return fields.length > 0 ? fields : null
              }
            )

            await tick(50, 'Halfway there, hang tight...')

            const sheets = workbook.sheets!.map((sheet, index) => {
              const mappedWorkbookFields = filteredWorkbookFields![index]

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

            await tick(80, 'Almost done...')

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
                message: 'Table update complete. Please audit the data',
                acknowledge: false,
              },
            }
          } catch (error) {
            // If something goes wrong while executing the custom job, we fail the job with a message on what next steps to take
            logError(
              '@flatfile/plugin-view-mapped',
              JSON.stringify(error, null, 2)
            )
            throw new Error(
              'An error occured while updating the workbook. See Event Logs.'
            )
          }
        }
      )
    )
  }
}
