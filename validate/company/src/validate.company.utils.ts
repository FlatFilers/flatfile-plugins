import { FlatfileClient } from '@flatfile/api'
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'
import fetch from 'cross-fetch'

const api = new FlatfileClient()

export const validateCompanyName = (name: string): boolean => {
  return typeof name === 'string' && name.length > 1
}

export const validateCompanyWebsite = (website: string): boolean => {
  const websiteRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return websiteRegex.test(website)
}

export const validateAddress = async (
  address: string,
  client: Client,
  apiKey: string
): Promise<boolean> => {
  try {
    const response = await client.findPlaceFromText({
      params: {
        input: address,
        inputtype: PlaceInputType.textQuery,
        key: apiKey,
        fields: ['formatted_address'],
      },
    })
    return response.data.candidates.length > 0
  } catch (error) {
    console.error('Error validating address:', error)
    return false
  }
}

export const validateEIN = async (
  ein: string,
  apiKey: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.einverification.com/verify/${ein}`, //TODO: find a working API
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )
    const data = await response.json()
    return data.valid
  } catch (error) {
    console.error('Error validating EIN:', error)
    return false
  }
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
    console.error(e, `Error fetching secret ${name}`)
  }
}
