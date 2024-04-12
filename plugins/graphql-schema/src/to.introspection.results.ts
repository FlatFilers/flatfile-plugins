import {
  GraphQLSchema,
  buildSchema,
  getIntrospectionQuery,
  graphqlSync,
} from 'graphql'

function getIntrospectionResults(schema: GraphQLSchema) {
  const query = getIntrospectionQuery()
  const result = graphqlSync({ schema, source: query })
  return result.data
}

export function introspectSchema(schema: GraphQLSchema) {
  return getIntrospectionResults(schema)
}

export function introspectSDL(graphQLSDL: string) {
  const schema = buildSchema(graphQLSDL)
  return getIntrospectionResults(schema)
}

export async function introspectUrl(url: string) {
  const query = getIntrospectionQuery()
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch GraphQL schema: ${response.statusText}`)
  }

  const { data } = await response.json()
  return data
}
