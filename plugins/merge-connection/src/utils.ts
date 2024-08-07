import { Flatfile, FlatfileClient } from '@flatfile/api'
import { MergeClient, MergeEnvironment } from '@mergeapi/merge-node-client'

const api = new FlatfileClient()

export function getMergeClient(apiKey: string, accountToken?: string) {
  return new MergeClient({
    environment: MergeEnvironment.Production,
    apiKey,
    ...(accountToken ? { accountToken } : {}),
  })
}

export function handleError(error: any, message: string) {
  console.error(error)
  throw new Error(`${message}: ${error.message}`)
}

export async function getSecret(
  spaceId: string,
  environmentId: string,
  name: string
): Promise<string | undefined> {
  try {
    const secrets = await api.secrets.list({ spaceId, environmentId })
    return secrets.data.find((secret) => secret.name === name)?.value
  } catch (e) {
    handleError(e, `Error fetching secret ${name}`)
  }
}

export function mapRecords(
  records: Record<string, any>
): Flatfile.RecordData[] {
  return Object.values(records).map((record) => {
    const mappedRecord: Flatfile.RecordData = {}
    for (let key in record) {
      mappedRecord[key] = { value: record[key]?.toString() }
    }
    return mappedRecord
  })
}

export function snakeToCamel(snakeCaseString: string): string {
  return snakeCaseString
    .split('_')
    .map((word, index) => {
      if (index === 0) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}
