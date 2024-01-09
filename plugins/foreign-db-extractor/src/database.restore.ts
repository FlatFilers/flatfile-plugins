import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sql from 'mssql'

const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function uploadFileToS3Bucket(
  bucketName: string,
  buffer: Buffer,
  fileName: string
) {
  try {
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
    })
    await s3Client.send(putObjectCommand)
  } catch (error) {
    console.error('Error during S3 upload:', error)
    throw new Error('Error during S3 upload')
  }
}

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
      //TODO needs to timeout after so many tries
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

export async function renameDatabase(
  connConfig: sql.config,
  oldName: string,
  newName: string
) {
  let conn
  try {
    conn = await sql.connect({ ...connConfig, database: 'master' })
    const renameDbCommand = `EXECUTE rdsadmin.dbo.rds_modify_db_name N'${oldName}', N'${newName}'`
    await conn.query(renameDbCommand)
    console.log(`Database ${oldName} renamed to ${newName} in RDS instance.`)
  } catch (error) {
    console.error('Error during database rename in RDS:', error)
    throw new Error('Error during database rename in RDS')
  } finally {
    if (conn) {
      conn.close()
    }
  }
}
