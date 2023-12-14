import api, { Flatfile } from '@flatfile/api'
import sql from 'mssql'
import { makeId } from './make.id'

const recordIdField = '_flatfile_record_id'

export async function restoreDatabaseFromBackup(
  connConfig: sql.config,
  s3Arn: string
) {
  let conn
  const dbName = connConfig.database
  try {
    conn = await sql.connect({ ...connConfig, database: 'master' }) // Connecting to the master database to execute restore command
    const command = `
      exec msdb.dbo.rds_restore_database 
      @restore_db_name='${dbName}', 
      @s3_arn_to_restore_from='${s3Arn}'
    `

    await conn.query(command)
    console.log(`Database restore initiated for ${dbName}`)

    // Checking if the database is available
    let isAvailable = false
    while (!isAvailable) {
      const result = await conn.query(
        `SELECT state_desc FROM sys.databases WHERE name = '${dbName}'`
      )
      if (result.recordset.length > 0 && result.recordset[0].state_desc) {
        const dbState = result.recordset[0].state_desc
        if (dbState === 'ONLINE') {
          isAvailable = true
          console.log(`Database ${dbName} is available.`)
        } else {
          console.log(
            `Waiting for database ${dbName} to become available... Current state: ${dbState}`
          )
          await new Promise((resolve) => setTimeout(resolve, 30_000))
        }
      } else {
        console.log(`Database ${dbName} not found, waiting...`)
        await new Promise((resolve) => setTimeout(resolve, 30_000))
      }
    }
  } catch (error) {
    console.error('Error during database restore:', error)
  } finally {
    if (conn) {
      conn.close()
      console.log('Closed SQL connection.')
    }
  }
}

export async function getTablesAndColumns(connConfig: sql.config) {
  let tables = {}
  let conn
  let connectionError = true
  let retries = 0
  while (connectionError && retries < 6) {
    try {
      conn = await sql.connect(connConfig)
      connectionError = false
      console.log(`Connected to SQL. Retried ${retries} times.`)
      await conn.query(`DROP TABLE Sales`) // TODO: Hack -- drop the 7 million row table on the example .bak
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

export function generateSheets(tables: object) {
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

export async function createWorkbook(
  spaceId: string,
  environmentId: string,
  sheets: Flatfile.SheetConfig[],
  name: string,
  connectionConfig: sql.config
) {
  const { data: workbook } = await api.workbooks.create({
    name: `[file] ${name}`,
    labels: ['file'],
    spaceId,
    environmentId,
    sheets,
    metadata: {
      connectionType: 'FOREIGN_MSSQL',
      connectionConfig,
    },
  })

  return workbook
}

// TODO this probably should be in Platform
export async function sheetsTransformer(
  sheets: Flatfile.Sheet[],
  connConfig: sql.config
) {
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i]
    const parts = sheet.id.split('_')
    const newTableName = parts[parts.length - 1]
    const sheetName = sheet.name

    try {
      // Rename the table to match the sheet ID
      await renameTable(connConfig, sheetName, newTableName)

      // Populate the `_flatfile_record_id` and add a `rowid` column
      await recordTransformer(connConfig, newTableName)
    } catch (error) {
      console.error(`Error processing sheet ${sheetName}:`, error)
    }
  }
}

async function renameTable(
  connConfig: sql.config,
  oldTableName: string,
  newTableName: string
) {
  let conn
  try {
    conn = await sql.connect(connConfig)
    const request = conn.request()

    request.input('oldName', sql.VarChar, oldTableName)
    request.input('newName', sql.VarChar, newTableName)

    await request.query(`EXEC sp_rename @oldName, @newName, 'OBJECT'`)
    console.log(`Table renamed from ${oldTableName} to ${newTableName}`)
  } catch (error) {
    console.error('Error renaming table:', error)
    throw error
  } finally {
    if (conn) {
      conn.close()
      console.log('Closed SQL connection.')
    }
  }
}

// This function adds a _flatfile_record_id and rowid columns to the table
async function recordTransformer(connConfig: sql.config, tableName: string) {
  let conn
  try {
    console.log(`Populating record IDs for table: ${tableName}`)
    conn = await sql.connect(connConfig)
    const request = conn.request()

    // Ensure the field name is properly enclosed in square brackets
    const safeRecordIdField = `[${recordIdField}]`

    // Check if the column exists...
    console.log(`Check if the column exists...`)
    const columnCheck = await request.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${recordIdField}'`
    )
    if (columnCheck.recordset.length === 0) {
      // Add _flatfile_record_id column to the table
      console.log(`Add _flatfile_record_id column to the table`)
      await request.query(
        `ALTER TABLE ${tableName} ADD ${safeRecordIdField} VARCHAR(255);`
      )
    }

    // Add a `rowid` column to the table to join on later (instead of the identity column)
    console.log(`Add a rowid column to the table`)
    await request.query(`
      CREATE SEQUENCE ${tableName}_rowid
        START WITH 1
        INCREMENT BY 1;
    `)
    await request.query(`
      ALTER TABLE ${tableName}
        ADD rowid INT;
    `)
    await request.query(`
      UPDATE ${tableName}
        SET rowid = NEXT VALUE FOR ${tableName}_rowid;
    `)
    await request.query(`CREATE UNIQUE INDEX rowid_index ON ${tableName} (rowid);
    `)

    // Count Rows
    console.log(`Count Rows`)
    const countsResult = await request.query(
      `SELECT COUNT(*) as count FROM ${tableName};`
    )
    const count = countsResult.recordset[0].count

    // Generate record IDs
    const recordIds = Array.from({ length: count }, () => makeId())

    // Create a temporary ${tableName}_tmp_record_ids table
    console.log(`Create a temporary ${tableName}_tmp_record_ids table`)
    await request.query(
      `CREATE TABLE ${tableName}_tmp_record_ids (id VARCHAR(255), rowid INT IDENTITY(1,1))`
    )

    // Insert RecordIds into Temporary Table in chunks
    console.log(`Insert RecordIds into Temporary Table in chunks`)
    const chunkSize = 1000 // Max number of rows MSSQL can insert at once
    for (let i = 0; i < recordIds.length; i += chunkSize) {
      const chunk = recordIds.slice(i, i + chunkSize)
      const values = chunk.map((id) => `('${id}')`).join(', ')
      await request.query(
        `INSERT INTO ${tableName}_tmp_record_ids (id) VALUES ${values}`
      )
    }

    // Populate the _flatfile_record_id
    console.log(`Populate the _flatfile_record_id`)
    let updatedRows = 0
    let totalUpdated = 0
    do {
      const updateQuery = `
          UPDATE TOP (${chunkSize}) t
          SET t.${safeRecordIdField} = r.id
          FROM ${tableName} t
          INNER JOIN ${tableName}_tmp_record_ids r ON t.rowid = r.rowid
          WHERE t.${safeRecordIdField} IS NULL;
        `
      const result = await request.query(updateQuery)
      updatedRows = result.rowsAffected[0]
      totalUpdated += updatedRows
      console.log(`Updated ${updatedRows} rows. Total updated: ${totalUpdated}`)
    } while (updatedRows === chunkSize)

    // Drop the temporary table
    await request.query(`DROP TABLE ${tableName}_tmp_record_ids`)
    console.log(`Record IDs populated for table: ${tableName}`)
  } catch (error) {
    console.error('Error adding record id:', error)
    throw error
  } finally {
    if (conn) {
      conn.close()
      console.log('Closed SQL connection.')
    }
  }
}
