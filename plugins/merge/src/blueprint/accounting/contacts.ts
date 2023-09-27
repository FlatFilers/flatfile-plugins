import { Flatfile } from '@flatfile/api'

export const contacts: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
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
      key: 'is_supplier',
      label: 'Is supplier',
      type: 'boolean',
    },
    {
      key: 'is_customer',
      label: 'Is customer',
      type: 'boolean',
    },
    {
      key: 'email_address',
      label: 'Email address',
      type: 'string',
    },
    {
      key: 'tax_number',
      label: 'Tax number',
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
      key: 'currency',
      label: 'Currency',
      type: 'string',
    },
    {
      key: 'remote_updated_at',
      label: 'Remote updated at',
      type: 'string',
    },
    {
      key: 'company',
      label: 'Company',
      type: 'string',
    },
    // addresses: Array
    // phone_numbers: AccountPhoneNumber[]
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
