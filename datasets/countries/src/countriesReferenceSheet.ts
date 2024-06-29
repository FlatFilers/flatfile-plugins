import type { Flatfile } from '@flatfile/api'

export const countriesReferenceSheet: Flatfile.SheetConfig = {
  name: 'Countries',
  slug: 'countriesReferenceSheet',
  fields: [
    {
      key: 'iso_a2',
      type: 'string',
      label: 'ISO A2',
    },
    {
      key: 'iso3',
      type: 'string',
      label: 'ISO3',
    },
    {
      key: 'iso_numeric',
      type: 'string',
      label: 'ISO-Numeric',
    },
    {
      key: 'fips',
      type: 'string',
      label: 'fips',
    },
    {
      key: 'impact_country',
      type: 'string',
      label: 'Impact Country',
    },
    {
      key: 'capital',
      type: 'string',
      label: 'Capital',
    },
    {
      key: 'area',
      type: 'string',
      label: 'Area',
    },
    {
      key: 'population',
      type: 'string',
      label: 'Population',
    },
    {
      key: 'continent',
      type: 'string',
      label: 'Continent',
    },
    {
      key: 'tld',
      type: 'string',
      label: 'tld',
    },
    {
      key: 'currency_code',
      type: 'string',
      label: 'Currency Code',
    },
    {
      key: 'currency_name',
      type: 'string',
      label: 'Currency Name',
    },
    {
      key: 'phone',
      type: 'string',
      label: 'Phone',
    },
    {
      key: 'postal_code_format',
      type: 'string',
      label: 'Postal Code Format',
    },
    {
      key: 'postal_code_regex',
      type: 'string',
      label: 'Postal Code Regex',
    },
    {
      key: 'languages',
      type: 'string',
      label: 'Languages',
    },
    {
      key: 'geonameid',
      type: 'string',
      label: 'Geoname ID',
    },
    {
      key: 'neighbours',
      type: 'string',
      label: 'Neighbours',
    },
  ],
}
