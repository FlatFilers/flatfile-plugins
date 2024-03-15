import fetch from 'node-fetch'

/**
 * The getUser function is responsible for retrieving the user credentials for the database. It sends a GET request to
 * the foreigndb API to retrieve the user credentials for the database. This must be called after the database restore
 * is complete.
 *
 * @param workbookId
 * @returns
 */
export async function getUser(workbookId: string): Promise<DBUser | Error> {
  const userResponse = await fetch(
    `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${workbookId}/user`,
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
}

/**
 * The pollForUser function is responsible for polling the foreigndb API to retrieve the user credentials for the database.
 * After the database restore is complete, it can take some time for the user credentials to be available.
 *
 * @param workbookId
 * @returns
 */
export async function pollForUser(workbookId: string): Promise<DBUser | Error> {
  let attempts = 0
  const maxAttempts = 10
  const retryDelay = 5000

  while (attempts < maxAttempts) {
    try {
      const user = (await getUser(workbookId)) as DBUser
      if (user.username && user.password) {
        return user
      }
    } catch (error) {}

    await new Promise((resolve) => setTimeout(resolve, retryDelay))
    attempts++
  }
  throw new Error('Failed to retrieve user credentials')
}

export type DBUser = {
  username: string
  password: string
}

type AddUserResponse = {
  data: {
    username: string
    password: string
  }
  errors: [{ key: string; message: string }]
}
