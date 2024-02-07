import fetch from 'node-fetch'

export async function s3Upload(fileId: string) {
  const storageUploadResponse = await fetch(
    `${process.env.FLATFILE_API_URL}/v1/storage/upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
      },
      body: JSON.stringify({
        fileId,
      }),
    }
  )

  const jsonResponse = (await storageUploadResponse.json()) as S3UploadResponse
  if (storageUploadResponse.status !== 200) {
    throw new Error(jsonResponse.errors[0].message)
  }

  return jsonResponse.arn
}

type S3UploadResponse = {
  arn: string
  errors: { message: string }[]
}
