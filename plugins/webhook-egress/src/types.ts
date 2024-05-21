import type { Flatfile } from '@flatfile/api'

export interface SheetExport extends Flatfile.Sheet {
  records: Flatfile.Record_[]
}

export interface WebhookEgressOptions {
  secretName?: string
  urlParams?: Array<{ key: string; value: unknown }>
  pageSize?: number
  filter?: Flatfile.Filter
  debug?: boolean
}
