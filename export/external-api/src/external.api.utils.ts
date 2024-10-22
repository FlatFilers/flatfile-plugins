import fetch from 'cross-fetch'

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
