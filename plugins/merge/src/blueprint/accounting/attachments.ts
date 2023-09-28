import { Flatfile } from '@flatfile/api'

export const attachments: Flatfile.SheetConfig = {
  name: 'Attachments',
  slug: 'attachments',
  readonly: true,
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
      // constraints: [{ type: 'required' }],
    },
    {
      key: 'remote_id',
      label: 'Remote ID',
      type: 'string',
    },
    {
      key: 'file_name',
      label: 'File name',
      type: 'string',
    },
    {
      key: 'file_url',
      label: 'File url',
      type: 'string',
    },
    {
      key: 'company',
      label: 'Company',
      type: 'string',
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
    // field_mappings: Object
    // remote_data: RemoteData[]
  ],
  actions: [],
}
