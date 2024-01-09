import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sql from 'mssql'
import fetch from 'node-fetch'

/**
 * The restoreDatabase function is responsible for initiating the database restore process. It sends a POST request to
 * the foreigndb API to restore the database from the given fileId. The databaseName should be the workbookId for the
 * Workbook that will be associated to the file being restored.
 *
 * @param databaseName
 * @param fileId
 * @returns
 */
export async function restoreDatabase(
  databaseName: string,
  fileId: string
): Promise<sql.config | Error> {
  try {
    const response = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${databaseName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN}`,
        },
        body: JSON.stringify({
          fileId,
        }),
      }
    )

    const jsonResponse = (await response.json()) as RestoreDatabaseResponse

    if (response.status !== 200) {
      throw new Error(
        `Status: ${response.status} Message: ${jsonResponse.errors[0].message}`
      )
    }
    const data = jsonResponse.data

    return {
      server: data.host,
      database: data.dbname,
      options: { port: data.port, trustServerCertificate: true },
      connectionTimeout: 30000,
      requestTimeout: 90000,
      timeout: 15000,
    }
  } catch (e) {
    throw new Error(`An error occurred during DB restore: ${e.message}`)
  }
}

/**
 * The getDatabaseInfo function is responsible for retrieving the status of the database restore process. It sends a GET
 * request to the foreigndb API to retrieve the status of the database restore process.
 *
 * @param databaseName
 * @returns
 */
export async function getDatabaseInfo(
  databaseName: string
): Promise<Task | Error> {
  try {
    const response = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${databaseName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN}`,
        },
      }
    )
    const jsonResponse = (await response.json()) as GetDatabaseResponse

    if (response.status !== 200) {
      throw new Error(
        `Status: ${response.status} Message: ${jsonResponse.errors[0].message}`
      )
    }
    return jsonResponse.data.task
  } catch (e) {
    throw new Error(`An error occurred retrieving DB info: ${e.message}`)
  }
}

/**
 * The getUser function is responsible for retrieving the user credentials for the database. It sends a GET request to
 * the foreigndb API to retrieve the user credentials for the database. This must be called after the database restore
 * is complete.
 *
 * @param databaseName
 * @returns
 */
export async function getUser(databaseName: string): Promise<DBUser | Error> {
  try {
    const userResponse = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${databaseName}/user`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN}`,
        },
      }
    )

    const jsonResponse = (await userResponse.json()) as AddUserResponse

    if (userResponse.status !== 200) {
      throw new Error(
        `Status: ${userResponse.status} Message: ${jsonResponse.errors[0].message}`
      )
    }
    const data = jsonResponse.data

    return { ...data }
  } catch (e) {
    throw new Error(`An error occurred adding user to database: ${e.message}`)
  }
}

/**
 * The pollDatabaseStatus function is responsible for polling the database status until it is complete. It sends a GET
 * request to the foreigndb API to retrieve the status of the database restore process. It will continue to poll until
 * the status is either 'SUCCESS' or 'ERROR'.
 *
 * @param connectionConfig
 * @returns
 */
export async function pollDatabaseStatus(
  connectionConfig: sql.config
): Promise<void> {
  const maxAttempts = 36 // 3 minutes
  const retryDelay = 5_000
  let attempts = 0
  let status
  while (attempts < maxAttempts && !['SUCCESS', 'ERROR'].includes(status)) {
    const task = (await getDatabaseInfo(connectionConfig.database)) as Task
    status = task.status
    await new Promise((resolve) => setTimeout(resolve, retryDelay))
    attempts++
  }

  if (!status || status === 'ERROR') {
    throw new Error('Database restore failed')
  }
}

export type DBUser = {
  username: string
  password: string
}

type RestoreDatabaseResponse = {
  data: {
    host: string
    port: number
    dbname: string
  }
  errors: [{ key: string; message: string }]
}

type GetDatabaseResponse = {
  data: {
    task: {
      status: string
      progress: number
      type: string
    }
  }
  errors: any[]
}

type AddUserResponse = {
  data: {
    username: string
    password: string
  }
  errors: [{ key: string; message: string }]
}

type Task = {
  status: string
  progress: number
  type: string
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
