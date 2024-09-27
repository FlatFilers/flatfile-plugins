import { FlatfileClient } from '@flatfile/api'

const api = new FlatfileClient()

export async function getSecret(
  name: string,
  environmentId?: string,
  spaceId?: string
): Promise<string | undefined> {
  try {
    const secrets = await api.secrets.list({ spaceId, environmentId })
    const secret = secrets.data.find((secret) => secret.name === name)
    if (!secret) {
      return undefined
    }
    return secret.value
  } catch (e) {
    console.error(e, `Error fetching secret ${name}`)
    return undefined
  }
}
