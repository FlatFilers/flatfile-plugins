import sql from 'mssql'
import fetch from 'node-fetch'

/**
 * The restoreDatabase function is responsible for initiating the database restore process. It sends a POST request to
 * the foreigndb API to restore the database from the given fileId. The workbookId should be the workbookId for the
 * Workbook that will be associated to the file being restored.
 *
 * @param workbookId
 * @param fileId
 * @returns
 */
export async function restoreDatabase(
  workbookId: string,
  fileId: string
): Promise<sql.config | Error> {
  try {
    const response = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${workbookId}`,
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

type RestoreDatabaseResponse = {
  data: {
    host: string
    port: number
    dbname: string
  }
  errors: [{ key: string; message: string }]
}
