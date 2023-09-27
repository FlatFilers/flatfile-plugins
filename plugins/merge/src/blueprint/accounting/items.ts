import { Flatfile } from '@flatfile/api'

export const items: Flatfile.SheetConfig = {
  name: 'Items',
  slug: 'items',
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
      constraints: [{ type: 'required' }],
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
      key: 'status',
      label: 'Status',
      type: 'enum',
      config: {
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
      },
    },
    {
      key: 'unit_price',
      label: 'Unit price',
      type: 'number',
    },
    {
      key: 'purchase_price',
      label: 'Purchase price',
      type: 'number',
    },
    {
      key: 'purchase_account',
      label: 'Purchase account',
      type: 'string',
    },
    {
      key: 'sales_account',
      label: 'Sales account',
      type: 'string',
    },
    {
      key: 'company',
      label: 'Company',
      type: 'string',
    },
    {
      key: 'remote_updated_at',
      label: 'Remote updated at',
      type: 'string',
    },
    {
      key: 'remote_was_deleted',
      label: 'Remote was deleted',
      type: 'boolean',
      constraints: [{ type: 'required' }],
    },
    {
      key: 'modified_at',
      label: 'Modified at',
      type: 'string',
      constraints: [{ type: 'required' }],
    },
    // field_mappings: Object
    // remote_data: RemoteData[]
  ],
  actions: [],
}
