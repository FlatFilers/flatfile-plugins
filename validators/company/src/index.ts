import { FlatfileClient } from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'
import fetch from 'cross-fetch'

const api = new FlatfileClient()

export interface CompanyValidationConfig {
  sheetSlug: string
  validateAddress: boolean
  validateEIN: boolean
}

const validateCompanyName = (name: string): boolean => {
  return typeof name === 'string' && name.length > 1
}

const validateCompanyWebsite = (website: string): boolean => {
  const websiteRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return websiteRegex.test(website)
}

const validateAddress = async (
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

const validateEIN = async (ein: string, apiKey: string): Promise<boolean> => {
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

async function getSecret(
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

export function companyValidationPlugin(config: CompanyValidationConfig) {
  const mapsClient = new Client({})

  return recordHook(config.sheetSlug, async (record, event?: FlatfileEvent) => {
    const { spaceId, environmentId } = event?.context
    const googleMapsApiKey = await getSecret(
      spaceId,
      environmentId,
      'GOOGLE_MAPS_API_KEY'
    )

    const einVerificationApiKey = await getSecret(
      spaceId,
      environmentId,
      'EIN_VERIFICATION_API_KEY'
    )

    const companyName = record.get('company_name') as string
    const companyWebsite = record.get('company_website') as string
    const companyAddress = record.get('company_address') as string
    const companyEIN = record.get('company_ein') as string

    if (!validateCompanyName(companyName)) {
      record.addError('company_name', 'Invalid company name')
    }

    if (!validateCompanyWebsite(companyWebsite)) {
      record.addError('company_website', 'Invalid company website')
    }
    if (config.validateAddress && googleMapsApiKey) {
      const isValidAddress = await validateAddress(
        companyAddress,
        mapsClient,
        googleMapsApiKey
      )
      if (!isValidAddress) {
        record.addError('company_address', 'Invalid company address')
      }
    }

    if (config.validateEIN && einVerificationApiKey) {
      const isValidEIN = await validateEIN(companyEIN, einVerificationApiKey)
      if (!isValidEIN) {
        record.addError('company_ein', 'Invalid EIN')
      }
    }

    return record
  })
}
