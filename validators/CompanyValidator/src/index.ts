import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'
import { Client } from '@googlemaps/google-maps-services-js'
import axios from 'axios'

interface CompanyValidationConfig {
  sheetSlug: string
  googleMapsApiKey: string
  einVerificationApiKey: string
  validateAddress: boolean
  validateEIN: boolean
}

const validateCompanyName = (name: string): boolean => {
  return name.length > 1
}

const validateCompanyWebsite = (website: string): boolean => {
  const websiteRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return websiteRegex.test(website)
}

const validateAddress = async (
  address: string,
  client: Client
): Promise<boolean> => {
  try {
    const response = await client.findPlaceFromText({
      params: {
        input: address,
        inputtype: 'textquery',
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
    const response = await axios.get(
      `https://api.einverification.com/verify/${ein}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )
    return response.data.valid
  } catch (error) {
    console.error('Error validating EIN:', error)
    return false
  }
}

export default function companyValidationPlugin(
  config: CompanyValidationConfig
) {
  const mapsClient = new Client({})

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug, async (record) => {
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

        if (config.validateAddress) {
          const isValidAddress = await validateAddress(
            companyAddress,
            mapsClient
          )
          if (!isValidAddress) {
            record.addError('company_address', 'Invalid company address')
          }
        }

        if (config.validateEIN) {
          const isValidEIN = await validateEIN(
            companyEIN,
            config.einVerificationApiKey
          )
          if (!isValidEIN) {
            record.addError('company_ein', 'Invalid EIN')
          }
        }

        return record
      })
    )
  }
}
