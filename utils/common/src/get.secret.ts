import api from '@flatfile/api'
import { handleError } from './logging.helper'

export async function getSecret(
  name: string,
  environmentId: string,
  spaceId?: string
): Promise<string | undefined> {
  try {
    const secrets = await api.secrets.list({ spaceId, environmentId })
    return secrets.data.find((secret) => secret.name === name)?.value
  } catch (e) {
    handleError(e, `Error fetching secret ${name}`)
  }
}
