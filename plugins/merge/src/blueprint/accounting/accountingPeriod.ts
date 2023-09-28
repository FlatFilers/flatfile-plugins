import { Flatfile } from '@flatfile/api'

export const accountingPeriod: Flatfile.SheetConfig = {
  name: 'Accounting Period',
  slug: 'accountingPeriods',
  readonly: true,
  fields: [
    {
      key: 'start_date',
      label: 'Start date',
      type: 'string',
    },
    {
      key: 'end_date',
      label: 'End date',
      type: 'string',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      config: {
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ],
      },
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
    },
    {
      key: 'id',
      label: 'ID',
      type: 'string',
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
