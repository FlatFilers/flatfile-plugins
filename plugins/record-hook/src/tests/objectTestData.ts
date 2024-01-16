import type { Flatfile } from '@flatfile/api'

export const defaultObjectValueSchema: Array<Flatfile.Property> = [
  {
    key: 'array',
    type: 'enum',
    config: {
      options: [
        {
          value: 'defaultValue',
          label: 'Default Value',
        },
        {
          value: 'secondValue',
          label: 'Second Value',
        },
      ],
    },
  },
]

export const defaultObjectValueData: Record<string, any>[] = [
  {
    array: 'defaultValue',
  },
]
