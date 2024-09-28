import type { Flatfile } from '@flatfile/api'

export const zipCodeReferenceSheet: Flatfile.SheetConfig = {
  name: 'Zip Codes',
  slug: 'zipCodeReferenceSheet',
  fields: [
    {
      key: 'zip_code',
      type: 'number',
      label: 'Zip Code',
      constraints: [{ type: 'required' }],
    },
    {
      key: 'city',
      type: 'string',
      label: 'City',
    },
    {
      key: 'state_code',
      type: 'string',
      label: 'State Code',
    },
    {
      key: 'state_name',
      type: 'string',
      label: 'State Name',
    },
    {
      key: 'population',
      type: 'string',
      label: 'Population',
    },
    {
      key: 'density',
      type: 'string',
      label: 'density',
    },
    {
      key: 'timezone',
      type: 'string',
      label: 'Timezone',
    },
    {
      key: 'latitude',
      type: 'string',
      label: 'Latitude',
    },
    {
      key: 'longitude',
      type: 'string',
      label: 'Longitude',
    },
  ],
  actions: [
    {
      operation: 'duplicateSheet',
      mode: 'foreground',
      label: 'Duplicate',
      description: 'Duplicate this sheet.',
    },
  ],
}
