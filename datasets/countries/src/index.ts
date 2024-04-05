import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { chunkify } from '@flatfile/util-common'
import { countries } from './dataset'

export async function populateCountriesData(
  sheetId: Flatfile.SheetId
): Promise<void> {
  const chunkedData = chunkify(countries, 1000)
  chunkedData.forEach(async (chunk) => {
    const records = chunk.map((r) => {
      return Object.keys(r).reduce((acc: Record<string, any>, k) => {
        const value = Array.isArray(r[k]) ? r[k].join(', ') : r[k]
        acc[k] = { value }
        return acc
      }, {})
    })
    await api.records.insert(sheetId, records)
  })
}

export * from './countriesReferenceSheet'
