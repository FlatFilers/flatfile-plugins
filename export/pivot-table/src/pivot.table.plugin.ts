import { FlatfileClient } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  convertPivotTableToMarkdown,
  generatePivotTable,
} from './pivot.table.utils'

const api = new FlatfileClient()

/**
 * Configuration interface for the Pivot Table plugin
 */
export interface PivotTableConfig {
  pivotColumn: string
  aggregateColumn: string
  aggregationMethod: 'sum' | 'average' | 'count' | 'min' | 'max'
  groupByColumn?: string
  debug?: boolean
}

/**
 * Pivot Table plugin for Flatfile
 * @param config PivotTable configuration
 * @returns A function that sets up the Flatfile Listener for pivot table generation
 */
export function pivotTablePlugin(config: PivotTableConfig) {
  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { job: 'workbook:generatePivotTable' },
      async (event: FlatfileEvent) => {
        const { jobId, workbookId, spaceId } = event.context

        try {
          await api.jobs.ack(jobId, {
            info: 'Starting job to generate pivot table',
            progress: 10,
          })

          const sheets = await api.sheets.list({ workbookId })
          const sheetId = sheets.data[0].id
          const {
            data: { records },
          } = await api.records.get(sheetId)

          const pivotTable = generatePivotTable(
            records,
            config.pivotColumn,
            config.aggregateColumn,
            config.aggregationMethod,
            config.groupByColumn
          )
          const markdownTable = convertPivotTableToMarkdown(pivotTable)

          await api.documents.create(spaceId, {
            title: 'Pivot Table View',
            body: markdownTable,
          })

          await api.jobs.complete(jobId, {
            outcome: {
              message:
                'Pivot table generated and saved as a document successfully.',
            },
          })
        } catch (error) {
          if (config.debug) {
            console.error('Error:', error)
          }
          await api.jobs.fail(jobId, {
            outcome: {
              message: `Pivot table generation or document creation failed: ${error.message}`,
            },
          })
        }
      }
    )
  }
}
