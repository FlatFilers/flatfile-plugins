import fetch from 'cross-fetch'

export async function s3Upload(
  workbookId: string,
  fileId: string
): Promise<boolean | Error> {
  try {
    const storageUploadResponse = await fetch(
      `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${workbookId}/storage`,
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

    const jsonResponse =
      (await storageUploadResponse.json()) as S3UploadResponse
    if (storageUploadResponse.status !== 200) {
      throw new Error(
        `Status: ${storageUploadResponse.status} Message: ${jsonResponse.errors[0].message}`
      )
    }
    return jsonResponse.data.success
  } catch (e) {
    throw new Error(
      `An error occurred during S3 upload: ${(e as Error).message}`
    )
  }
}

type S3UploadResponse = {
  data: {
    success: boolean
  }
  errors: [{ key: string; message: string }]
}
