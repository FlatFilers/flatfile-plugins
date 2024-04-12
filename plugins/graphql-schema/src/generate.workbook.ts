import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { GraphQLSchema } from 'graphql'
import { generateSheets } from './generate.sheet'
import {
  introspectSDL,
  introspectSchema,
  introspectUrl,
} from './to.introspection.results'
import type { PartialWorkbookConfig } from './types'
import { isValidUrl } from './utils'

export async function generateWorkbook(
  workbookConfig: PartialWorkbookConfig,
  event?: FlatfileEvent
): Promise<Flatfile.CreateWorkbookConfig> {
  const graphQLObjects = await getGraphQLObjectsFromSource(
    workbookConfig.source,
    event
  )
  const sheets = generateSheets(graphQLObjects, workbookConfig.sheets)

  return {
    name: 'GraphQL Workbook',
    ...workbookConfig,
    sheets,
  }
}

async function getGraphQLObjectsFromSource(source, event?: FlatfileEvent) {
  const introspectionQueryResults = await (async () => {
    if (typeof source === 'string') {
      return isValidUrl(source) ? introspectUrl(source) : introspectSDL(source)
    } else if (source instanceof GraphQLSchema) {
      return introspectSchema(source)
    } else if (typeof source === 'function') {
      return introspectSchema(await source(event))
    }
    throw new Error('Invalid source provided')
  })()

  return introspectionQueryResults.__schema.types.filter(
    (type) =>
      type.kind === 'OBJECT' &&
      !['Query', 'Mutation', 'Subscription'].includes(type.name) &&
      !type.name.startsWith('__') &&
      !type.name.startsWith('_')
  )
}
