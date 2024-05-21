import { getSecret, isValidUrl } from '@flatfile/util-common'
import { SheetExport } from './types'

export async function postToWebhook(
  sheetExport: SheetExport,
  url: string | URL,
  urlParams: Array<{ key: string; value: unknown }>,
  secretName: string,
  environmentId: string,
  spaceId: string
) {
  const baseUrl = isValidUrl(url)
    ? url
    : await getSecret(url as string, environmentId)
  const queryParams = new URLSearchParams()
  urlParams.forEach(({ key, value }) => {
    Array.isArray(value)
      ? value.forEach((v) => queryParams.append(key, String(v)))
      : queryParams.set(key, String(value))
  })
  const secret = secretName
    ? await getSecret(secretName, environmentId, spaceId)
    : ''
  const response = await fetch(`${baseUrl}?${queryParams}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({ sheet: sheetExport }),
  })
  if (!response.ok)
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  return response.json()
}
