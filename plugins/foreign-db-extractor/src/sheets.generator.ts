import type { Flatfile } from '@flatfile/api'
import sql from 'mssql'

export async function generateSheets(
  connConfig: sql.config
): Promise<Flatfile.SheetConfigUpdate[]> {
  const tables = await getTablesAndColumns(connConfig)
  return Object.keys(tables).map((tableName) => {
    return {
      name: tableName,
      slug: tableName,
      fields: tables[tableName].map((columnName) => {
        return {
          key: columnName,
          label: columnName,
          type: 'string',
        }
      }),
    }
  })
}

async function getTablesAndColumns(connConfig: sql.config) {
  const tables = {}
  let conn: sql.ConnectionPool
  try {
    conn = await sql.connect(connConfig)
    const query = `
      SELECT 
        TABLE_NAME, COLUMN_NAME 
      FROM 
        INFORMATION_SCHEMA.COLUMNS
      ORDER BY 
        TABLE_NAME, ORDINAL_POSITION
    `

    const result = await conn.query(query)
    result.recordset.forEach((row) => {
      if (!tables[row.TABLE_NAME]) {
        tables[row.TABLE_NAME] = []
      }
      tables[row.TABLE_NAME].push(row.COLUMN_NAME)
    })
  } catch (error) {
    throw error
  } finally {
    if (conn) {
      conn.close()
    }
  }

  return tables
}
