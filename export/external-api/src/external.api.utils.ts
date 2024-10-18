import { type SimpleRecord } from '@flatfile/util-common'
import fetch from 'cross-fetch'
import { type PluginConfig } from './external.api.plugin'

export function processRecord(
  record: SimpleRecord,
  mapping: PluginConfig['dataMapping']
): Record<string, unknown> {
  return Object.entries(mapping).reduce(
    (acc, [from, to]) => {
      acc[to] = record[from]
      return acc
    },
    {} as Record<string, unknown>
  )
}

export async function exportToExternalAPI(
  data: Record<string, unknown>[],
  apiEndpoint: string,
  authToken: string
): Promise<void> {
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError || new Error('Operation failed after max retries')
}
