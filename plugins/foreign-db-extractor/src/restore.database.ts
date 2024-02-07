import fetch from 'node-fetch'

export async function restoreDatabase(arn: string, workbookId: string) {
  const databaseRestoreResponse = await fetch(
    `${process.env.FLATFILE_API_URL}/v1/database/restore`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
      },
      body: JSON.stringify({
        databaseName: workbookId,
        arn,
      }),
    }
  )

  const jsonResponse =
    (await databaseRestoreResponse.json()) as RestoreDatabaseResponse

  if (databaseRestoreResponse.status !== 200) {
    throw new Error(jsonResponse.errors[0].message)
  }

  return jsonResponse.connection
}

type RestoreDatabaseResponse = {
  connection: string
  errors: { message: string }[]
}
