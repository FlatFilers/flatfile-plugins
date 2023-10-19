import api, { Flatfile } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'

export const AutoUpdateRecordsPlugin = () => {
  return (listener: FlatfileListener) => {
    listener.on('job:completed', async (event) => {
      if (event.payload.job.match(/^file:extract/)) {
        const jobs = await api.jobs.create({
          type: Flatfile.JobType.File,
          operation: `auto-update-records`,
          status: Flatfile.JobStatus.Ready,
          source: event.context.fileId,
        })
        await api.jobs.execute(jobs.data.id)
      }
    })
    listener.use(
      jobHandler('file:auto-update-records', async (event, tick) => {
        const { fileId, spaceId } = event.context
        const { data: file } = await api.files.get(fileId)
        const { data: fileWorkbook } = await api.workbooks.get(file.workbookId)

        const fileRecordsResults: Flatfile.RecordsWithLinks[] =
          await Promise.all(
            fileWorkbook.sheets.map(async (sheet) => {
              const { data: responseData } = await api.records.get(sheet.id)
              return responseData.records
            })
          )

        const fileRecords: Flatfile.Records = fileRecordsResults
          .flat()
          .map((record) => {
            const id = record.values?.id?.value as string

            if (!id || !id.match(/^\w+_rc_\w+$/)) return null

            return {
              id,
              values: record.values,
            } as Flatfile.Record_
          })
          .filter(Boolean)

        if (fileRecords.length === 0) {
          return {
            info: 'Extraction complete',
            outcome: {
              message:
                "No records found in the file. Make sure you've added a column with an `id` field containing valid Record ids.",
            },
          }
        }

        const { data: workbooks } = await api.workbooks.list({ spaceId })
        const relevantWorkbooks = workbooks.filter(
          (workbook) => !workbook.labels?.includes('file')
        )

        const sheetIdResults = await Promise.all(
          relevantWorkbooks.map(async (workbook) => {
            const { data: sheets } = await api.sheets.list({
              workbookId: workbook.id,
            })
            return sheets.map((sheet) => sheet.id)
          })
        )

        const sheetIds = sheetIdResults.flat()

        await Promise.all(
          sheetIds.map((sheetId) => api.records.update(sheetId, fileRecords))
        )

        return {
          info: 'Auto-update complete',
          outcome: {
            message: 'Records updated successfully.',
          },
        }
      })
    )
  }
}
