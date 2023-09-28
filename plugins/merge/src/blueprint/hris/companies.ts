import { Flatfile } from '@flatfile/api'

export const companies: Flatfile.SheetConfig = {
  name: 'Companies',
  slug: 'companies',
  readonly: true,
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
      key: 'legal_name',
      label: 'Legal Name',
      type: 'string',
    },
    {
      key: 'display_name',
      label: 'Display Name',
      type: 'string',
    },
    {
      key: 'ein',
      label: 'EIN',
      type: 'enum',
      config: {
        options: [],
      },
    },
    {
      key: 'remote_was_deleted',
      label: 'Remote was deleted',
      type: 'boolean',
      // constraints: [{ type: 'required' }],
    },
    {
      key: 'modified_at',
      label: 'Modified at',
      type: 'string',
      // constraints: [{ type: 'required' }],
    },
  ],
  actions: [],
}
