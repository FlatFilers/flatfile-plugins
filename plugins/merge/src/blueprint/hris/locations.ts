import { Flatfile } from '@flatfile/api'

export const locations: Flatfile.SheetConfig = {
  name: 'Locations',
  slug: 'locations',
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
    },
    {
      key: 'remote_id',
      label: 'Remote ID',
      type: 'string',
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
    },
    {
      key: 'phone_number',
      label: 'Phone number',
      type: 'string',
    },
    {
      key: 'street_1',
      label: 'Street 1',
      type: 'string',
    },
    {
      key: 'street_2',
      label: 'Street 2',
      type: 'string',
    },
    {
      key: 'city',
      label: 'City',
      type: 'string',
    },
    {
      key: 'state',
      label: 'State',
      type: 'string',
    },
    {
      key: 'zip_code',
      label: 'Zip code',
      type: 'string',
    },
    {
      key: 'country',
      label: 'Country',
      type: 'string',
    },
    {
      key: 'location_type',
      label: 'Location type',
      type: 'string',
    },
    {
      key: 'remote_was_deleted',
      label: 'Remote was deleted',
      type: 'string',
    },
    {
      key: 'modified_at',
      label: 'Modified at',
      type: 'string',
    },
  ],
  actions: [],
}
