import { FlatfileEvent } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { Client } from '@googlemaps/google-maps-services-js'
import {
  getSecret,
  validateAddress,
  validateCompanyName,
  validateCompanyWebsite,
  validateEIN,
} from './validate.company.utils'

export interface CompanyValidationConfig {
  sheetSlug: string
  validateAddress: boolean
  validateEIN: boolean
}

export function validateCompany(config: CompanyValidationConfig) {
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
