import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'

export function pivotTablePlugin(config: { apiKey: string }) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook('sheetSlug', async (record) => {
        // Process records here if needed
      })
    )

    listener.on(
      'job:ready',
      { job: 'workbook:generatePivotTable' },
      async (event: FlatfileEvent) => {
        const { jobId, workbookId, spaceId } = event.context
        const {
          pivotColumn,
          aggregateColumn,
          aggregationMethod,
          groupByColumn,
        } = event.payload

        try {
          await api.jobs.ack(jobId, {
            info: 'Starting job to generate pivot table',
            progress: 10,
          })

          const sheets = await api.sheets.list({ workbookId })
          const sheetId = sheets.data[0].id
          const records = await api.records.get(sheetId)

          const pivotTable = generatePivotTable(
            records.data,
            pivotColumn,
            aggregateColumn,
            aggregationMethod,
            groupByColumn
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

function generatePivotTable(
  records: any[],
  pivotColumn: string,
  aggregateColumn: string,
  aggregationMethod: 'sum' | 'average' | 'count' | 'min' | 'max',
  groupByColumn?: string
): any {
  const pivotData: { [key: string]: { [key: string]: number } } = {}

  records.forEach((record) => {
    const pivotKey = record[pivotColumn]
    const groupKey = groupByColumn ? record[groupByColumn] : 'Total'

    if (!pivotData[pivotKey]) {
      pivotData[pivotKey] = {}
    }

    if (!pivotData[pivotKey][groupKey]) {
      pivotData[pivotKey][groupKey] = {
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
      }
    }

    const value = Number(record[aggregateColumn]) || 0
    pivotData[pivotKey][groupKey].sum += value
    pivotData[pivotKey][groupKey].count++
    pivotData[pivotKey][groupKey].min = Math.min(
      pivotData[pivotKey][groupKey].min,
      value
    )
    pivotData[pivotKey][groupKey].max = Math.max(
      pivotData[pivotKey][groupKey].max,
      value
    )
  })

  // Apply the selected aggregation method
  Object.keys(pivotData).forEach((pivotKey) => {
    Object.keys(pivotData[pivotKey]).forEach((groupKey) => {
      const aggregatedData = pivotData[pivotKey][groupKey]
      switch (aggregationMethod) {
        case 'sum':
          pivotData[pivotKey][groupKey] = aggregatedData.sum
          break
        case 'average':
          pivotData[pivotKey][groupKey] =
            aggregatedData.sum / aggregatedData.count
          break
        case 'count':
          pivotData[pivotKey][groupKey] = aggregatedData.count
          break
        case 'min':
          pivotData[pivotKey][groupKey] = aggregatedData.min
          break
        case 'max':
          pivotData[pivotKey][groupKey] = aggregatedData.max
          break
      }
    })
  })

  return {
    pivotColumn,
    aggregateColumn,
    aggregationMethod,
    groupByColumn,
    data: pivotData,
  }
}

function convertPivotTableToMarkdown(pivotTable: any): string {
  const {
    pivotColumn,
    aggregateColumn,
    aggregationMethod,
    groupByColumn,
    data,
  } = pivotTable

  let markdown = `# Pivot Table\n\n`
  markdown += `- Pivot Column: ${pivotColumn}\n`
  markdown += `- Aggregate Column: ${aggregateColumn}\n`
  markdown += `- Aggregation Method: ${aggregationMethod}\n`
  if (groupByColumn) {
    markdown += `- Group By Column: ${groupByColumn}\n`
  }
  markdown += '\n'

  // Get unique group keys
  const groupKeys = new Set<string>()
  Object.values(data).forEach((group: any) => {
    Object.keys(group).forEach((key) => groupKeys.add(key))
  })
  const sortedGroupKeys = Array.from(groupKeys).sort()

  // Create table header
  markdown += `| ${pivotColumn} | ${sortedGroupKeys.join(' | ')} |\n`
  markdown += `| ${'-'.repeat(pivotColumn.length)} | ${sortedGroupKeys
    .map(() => '---')
    .join(' | ')} |\n`

  // Create table rows
  Object.entries(data).forEach(([pivotKey, groupData]: [string, any]) => {
    const row = sortedGroupKeys.map((groupKey) => {
      const value = groupData[groupKey]
      return value !== undefined ? value.toFixed(2) : '-'
    })
    markdown += `| ${pivotKey} | ${row.join(' | ')} |\n`
  })

  return markdown
}
