import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { Setup } from '@flatfile/plugin-space-configure'
import type { GraphQLSchema } from 'graphql'

export type GraphQLSetupFactory = Omit<Setup, 'workbooks'> & {
  workbooks: PartialWorkbookConfig[]
}

export type PartialWorkbookConfig = Omit<
  Flatfile.CreateWorkbookConfig,
  'sheets'
> & {
  source:
    | string // Either a url or a GraphQL schema definition language string
    | GraphQLSchema
    | ((event?: FlatfileEvent) => GraphQLSchema | Promise<GraphQLSchema>)
  sheets?: PartialSheetConfig[]
}

export type PartialSheetConfig = Omit<
  Flatfile.SheetConfig,
  'fields' | 'name' | 'slug'
> & {
  name?: string
  slug: string // Must match GraphQL object name, required for reference fields
}
