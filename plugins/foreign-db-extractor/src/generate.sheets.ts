import sql from 'mssql'

export async function generateSheets(connConfig: sql.config) {
  const tables = await getTablesAndColumns(connConfig)
  return Object.keys(tables).map((tableName) => {
    return {
      name: tableName,
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
  let tables = {}
  let conn
  let connectionError = true
  let retries = 0
  while (connectionError && retries < 6) {
    try {
      conn = await sql.connect(connConfig)
      connectionError = false
      console.log(`Connected to SQL. Retried ${retries} times.`)
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
      if (error.name === 'ConnectionError') {
        console.log('Waiting for SQL connection to be available...')
        retries++
        await new Promise((resolve) => setTimeout(resolve, 15_000))
      } else {
        console.log('Error connecting to SQL:', error)
        throw error
      }
    } finally {
      if (conn) {
        conn.close()
        console.log('Closed SQL connection.')
      }
    }
  }

  return tables
}
