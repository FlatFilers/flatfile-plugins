import { Flatfile } from '@flatfile/api'

export * from './RecordHook'
export * from './record.hook.plugin'

export type { FlatfileRecord } from '@flatfile/hooks'
export type FlatfileTickFunction = (
  progress: number,
  message?: string
) => Promise<Flatfile.JobResponse>
