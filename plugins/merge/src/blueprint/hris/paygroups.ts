import { Flatfile } from '@flatfile/api'

export const payGroups: Flatfile.SheetConfig = {
  name: 'Pay Groups',
  slug: 'payGroups',
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
      key: 'pay_group_name',
      label: 'Pay group name',
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
  ],
  actions: [],
}
