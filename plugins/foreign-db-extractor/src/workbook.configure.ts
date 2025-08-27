import type { Flatfile } from '@flatfile/api'
import fetch from 'cross-fetch'

/**
 * The configureWorkbook function is responsible for initiating the workbook configuration. It sends a GET request to
 * the foreigndb API to configure the workbook. This must be called after the database restore is complete.
 *
 * @param workbookId
 * @returns
 */
export async function configureWorkbook(
  workbookId: string
): Promise<Flatfile.SuccessData | Error> {
  const response = await fetch(
    `${process.env.AGENT_INTERNAL_URL}/v1/foreigndb/${workbookId}/configure`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN}`,
      },
    }
  )

  const jsonResponse = await response.json()

  if (response.status !== 200) {
    throw new Error(
      `Status: ${response.status} Message: ${jsonResponse.message}`
    )
  }

  return jsonResponse
}
