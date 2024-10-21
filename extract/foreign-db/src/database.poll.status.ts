import fetch from 'cross-fetch'

/**
 * The pollDatabaseStatus function is responsible for polling the database status until it is complete. It sends a GET
 * request to the foreigndb API to retrieve the status of the database restore process. It will continue to poll until
 * the status is either 'SUCCESS' or 'ERROR'.
 *
 * @param workbookId
 * @returns
 */
export async function pollDatabaseStatus(workbookId: string): Promise<void> {
  const maxAttempts = 36 // 3 minutes
  const retryDelay = 5_000
  let attempts = 0
  let status
  while (attempts < maxAttempts && !['SUCCESS', 'ERROR'].includes(status)) {
    try {
      const task = (await getDatabaseInfo(workbookId)) as Task
      status = task.status
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
      attempts++
    } catch (error) {}
  }

  if (!status || status === 'ERROR') {
    throw new Error('Database restore failed')
  }
}

/**
 * The getDatabaseInfo function is responsible for retrieving the status of the database restore process. It sends a GET
 * request to the foreigndb API to retrieve the status of the database restore process.
 *
 * @param workbookId
 * @returns
 */
export async function getDatabaseInfo(
  workbookId: string
): Promise<Task | Error> {
  try {
    const response = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${workbookId}`,
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

type Task = {
  status: string
  progress: number
  type: string
}
