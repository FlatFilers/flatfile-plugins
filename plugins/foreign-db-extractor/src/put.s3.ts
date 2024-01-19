import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function putInS3Bucket(
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
