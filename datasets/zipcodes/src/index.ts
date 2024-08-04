import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { chunkify } from '@flatfile/util-common'
import { zipcodes } from './dataset'
import type { ZipCodeData } from './types'

export async function populateZipCodeData(
  sheetId: Flatfile.SheetId
): Promise<void> {
  const chunkedData = chunkify(zipcodes, 1000)
  chunkedData.forEach(async (chunk) => {
    const records = chunk.map((zipCodeObj) => {
      return convertToRecord(zipCodeObj)
    })
    await api.records.insert(sheetId, records)
  })
}

function convertToRecord(zipCodeObj: ZipCodeData): Flatfile.RecordData {
  return {
    zip_code: { value: zipCodeObj.zip_code },
    population: { value: zipCodeObj.population },
    density: { value: zipCodeObj.density },
    timezone: { value: zipCodeObj.timezone },
    city: { value: zipCodeObj.usps_city },
    state_code: { value: zipCodeObj.stusps_code },
    state_name: { value: zipCodeObj.ste_name },
    longitude: { value: zipCodeObj.geo_point_2d.lon },
    latitude: { value: zipCodeObj.geo_point_2d.lat },
  }
}

export * from './zipCodeReferenceSheet'
