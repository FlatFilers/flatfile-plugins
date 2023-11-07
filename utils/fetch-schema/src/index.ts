import axios from 'axios'

export async function resolveReference(
  schema: any,
  ref: string,
  origin: string
): Promise<any> {
  const hashIndex = ref.indexOf('#')

  if (ref.startsWith('#/')) return resolveLocalReference(schema, ref)

  const urlPart = hashIndex >= 0 ? ref.substring(0, hashIndex) : ref
  const fragmentPart = hashIndex >= 0 ? ref.substring(hashIndex) : ''

  const externalSchema = await fetchExternalReference(`${origin}${urlPart}`)

  return fragmentPart
    ? resolveLocalReference(externalSchema, fragmentPart)
    : externalSchema
}

export async function fetchExternalReference(url: string): Promise<any> {
  try {
    const { status, data } = await axios.get(url, {
      validateStatus: () => true,
    })
    if (status !== 200)
      throw new Error(`API returned status ${status}: ${data.statusText}`)
    return data
  } catch (error: any) {
    throw new Error(`Error fetching external reference: ${error.message}`)
  }
}

export function resolveLocalReference(schema: any, ref: string): any {
  const resolved = ref
    .split('/')
    .slice(1)
    .reduce(
      (acc, part) =>
        acc && (acc[part] || acc.$defs?.[part] || acc.definitions?.[part]),
      schema
    )

  if (!resolved) throw new Error(`Cannot resolve reference: ${ref}`)
  return resolved
}
