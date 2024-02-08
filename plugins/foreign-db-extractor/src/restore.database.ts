import sql from 'mssql'
import fetch from 'node-fetch'

export async function restoreDatabase(
  databaseName: string,
  fileId: string
): Promise<sql.config> {
  const databaseRestoreResponse = await fetch(
    `${process.env.FLATFILE_API_URL}/v1/database/restore`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
      },
      body: JSON.stringify({
        databaseName,
        fileId,
      }),
    }
  )

  const jsonResponse =
    (await databaseRestoreResponse.json()) as RestoreDatabaseResponse

  if (databaseRestoreResponse.status !== 200) {
    throw new Error(jsonResponse.errors[0].message)
  }

  return {
    user: jsonResponse.username,
    password: jsonResponse.password,
    server: jsonResponse.host,
    database: jsonResponse.dbname,
    options: { port: 1433, trustServerCertificate: true },
    connectionTimeout: 30000,
    requestTimeout: 90000,
    timeout: 15000,
  }
}

type RestoreDatabaseResponse = {
  host: string
  port: number
  dbname: string
  username: string
  password: string
  errors: { message: string }[]
}
