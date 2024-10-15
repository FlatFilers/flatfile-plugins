/**
 * Generates a pivot table from the given records
 * @param records Array of record objects
 * @param pivotColumn Column to pivot on
 * @param aggregateColumn Column to aggregate
 * @param aggregationMethod Method of aggregation
 * @param groupByColumn Optional column to group by
 * @returns Pivot table object
 */
export function generatePivotTable(
  records: any[],
  pivotColumn: string,
  aggregateColumn: string,
  aggregationMethod: 'sum' | 'average' | 'count' | 'min' | 'max',
  groupByColumn?: string
): any {
  const pivotData: { [key: string]: { [key: string]: any } } = {}
  const groupKeys = new Set<string>()

  records.forEach((record) => {
    const pivotKey = record.values[pivotColumn].value
    const groupKey = groupByColumn
      ? record.values[groupByColumn].value
      : '__TOTAL__'
    groupKeys.add(groupKey)

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

    const value = Number(record.values[aggregateColumn].value) || 0
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
  const aggregationFunctions = {
    sum: (data: any) => data.sum,
    average: (data: any) => (data.count > 0 ? data.sum / data.count : 0),
    count: (data: any) => data.count,
    min: (data: any) => data.min,
    max: (data: any) => data.max,
  }

  Object.keys(pivotData).forEach((pivotKey) => {
    Object.keys(pivotData[pivotKey]).forEach((groupKey) => {
      const aggregatedData = pivotData[pivotKey][groupKey]
      const aggregationFunction = aggregationFunctions[aggregationMethod]
      if (aggregationFunction) {
        pivotData[pivotKey][groupKey] = aggregationFunction(aggregatedData)
      } else {
        console.error(`Unknown aggregation method: ${aggregationMethod}`)
        pivotData[pivotKey][groupKey] = 0 // or some other default value
      }
    })
  })

  return {
    pivotColumn,
    aggregateColumn,
    aggregationMethod,
    groupByColumn,
    data: pivotData,
    groupKeys: Array.from(groupKeys).sort(),
  }
}

export function convertPivotTableToMarkdown(pivotTable: any): string {
  const {
    pivotColumn,
    aggregateColumn,
    aggregationMethod,
    groupByColumn,
    data,
    groupKeys,
  } = pivotTable

  let markdown = `# Pivot Table

`
  markdown += `- Pivot Column: ${pivotColumn}
`
  markdown += `- Aggregate Column: ${aggregateColumn}
`
  markdown += `- Aggregation Method: ${aggregationMethod}
`
  if (groupByColumn) {
    markdown += `- Group By Column: ${groupByColumn}
`
  }
  markdown += '\n'

  // Create table header
  const headerRow = [
    pivotColumn,
    ...groupKeys.map((key) => (key === '__TOTAL__' ? 'Total' : key)),
  ]
  markdown += `| ${headerRow.join(' | ')} |
`
  markdown += `| ${headerRow.map(() => '---').join(' | ')} |
`

  // Create table rows
  Object.entries(data).forEach(([pivotKey, groupData]: [string, any]) => {
    const row = [pivotKey]
    groupKeys.forEach((groupKey) => {
      const value = groupData[groupKey]
      row.push(typeof value === 'number' ? value.toFixed(2) : value || '-')
    })
    markdown += `| ${row.join(' | ')} |
`
  })

  return markdown
}
