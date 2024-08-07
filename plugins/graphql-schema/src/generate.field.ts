import type { Flatfile } from '@flatfile/api'

export function generateField(
  field,
  sheetName: string,
  baseProperty?: Flatfile.BaseProperty
): Flatfile.Property {
  const base =
    baseProperty ||
    ({
      key: field.name,
      label: field.name,
      description: field.description || '',
      constraints: field.type.kind === 'NON_NULL' ? [{ type: 'required' }] : [],
    } as Flatfile.BaseProperty)

  if (field.type.kind === 'SCALAR') {
    return { ...base, type: getScalarType(field.type.name) }
  } else if (field.type.kind === 'OBJECT') {
    return {
      ...base,
      type: 'reference',
      config: { ref: field.type.name, key: 'id', relationship: 'has-one' },
    }
  } else if (field.type.kind === 'NON_NULL') {
    return generateField({ ...field, type: field.type.ofType }, sheetName, base)
  } else {
    console.log(
      `Field '${field.name}' on '${sheetName}' skipped because '${field.type.kind}' is unsupported.`
    )
    return null
  }
}

function getScalarType(scalar) {
  switch (scalar) {
    case 'Float':
    case 'Int':
      return 'number'
    case 'Boolean':
      return 'boolean'
    default:
      return 'string'
  }
}
