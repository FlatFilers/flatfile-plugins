import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import { flatToValues, schemaFromObjectList, xmlToJson } from './parser'
import api, { Flatfile } from '@flatfile/api'

export const XMLExtractor = (opts?: {
  separator?: string
  attributePrefix?: string
  transform?: (row: Record<string, any>) => Record<string, any>
}) => {
  return (handler: FlatfileListener) => {
    handler.use(
      fileBuffer('.xml', async (file, buffer, event) => {
        const job = await api.jobs.create({
          type: 'file',
          operation: 'extract',
          status: 'ready',
          source: event.context.fileId,
        })
        try {
          const json = xmlToJson(buffer.toString()).map(
            opts?.transform || ((x) => x)
          )
          const schema = schemaFromObjectList(json)
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            file.name,
            schema
          )
          await api.records.insert(workbook.sheets![0].id, flatToValues(json))
          await api.files.update(file.id, {
            workbookId: workbook.id,
          })
          await api.jobs.update(job.data.id, {
            status: 'complete',
          })
          console.log(workbook)
        } catch (e) {
          console.log(`error ${e}`)
          await api.jobs.update(job.data.id, {
            status: 'failed',
          })
        }
      })
    )
  }
}

async function createWorkbook(
  environmentId: string,
  file: Flatfile.File_,
  filename: string,
  fields: Array<{ key: string; type: 'string' }>
): Promise<Flatfile.Workbook> {
  const workbook = await api.workbooks.create({
    name: '[file] ' + filename,
    sheets: [
      {
        name: 'Default',
        fields,
      },
    ],
    spaceId: file.spaceId,
    labels: ['file'],
    environmentId,
  })
  return workbook.data
}
