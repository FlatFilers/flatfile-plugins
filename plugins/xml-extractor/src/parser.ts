import toJSON from 'xml-json-format'

export function flatToValues(
  obj: Record<string, any>[]
): Array<Record<string, { value: any }>> {
  return obj.map((obj) => {
    return mapObject(obj, (k, value) => [k, { value }])
  })
}

export function xmlToJson(xml: string): Array<Record<string, any>> {
  const json = findRoot(toJSON(xml))
  return json.map((obj) => flattenObject(obj))
}

export function schemaFromObjectList(
  arr: Array<Record<string, any>>
): Array<{ key: string; type: 'string' }> {
  const keys = arr.reduce((acc, o) => {
    return {
      ...acc,
      ...Object.keys(o).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    }
  }, {})
  const obj = Object.keys(keys).reduce(
    (acc, k) => ({ ...acc, [k]: { key: k, type: 'string' } }),
    {}
  )
  return Object.values(obj)
}

function flattenAttributes(obj: Record<string, any>): Record<string, any> {
  if ('_attributes' in obj) {
    const attributes = mapObject(obj._attributes, (k, v) => [`#${k}`, v])
    const out = {
      ...obj,
      ...attributes,
      _attributes: undefined,
    }
    delete out._attributes
    return out
  }
  return obj
}

function mapObject(
  obj: Record<string, any>,
  fn: (k: string, v: any) => [string, any]
) {
  return Object.keys(obj).reduce((acc, k) => {
    const [key, value] = fn(k, obj[k])
    return { ...acc, [key]: value }
  }, {})
}

function flattenObject(
  input: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const obj = flattenAttributes(input)
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix
      ? prefix + (k.startsWith('#') || k === '_text' ? '' : '/')
      : ''
    if (typeof obj[k] === 'object') {
      return { ...acc, ...flattenObject(obj[k], pre + k) }
    } else {
      return { ...acc, [pre + (k === '_text' && pre ? '' : k)]: obj[k] }
    }
  }, {})
}

export function findRoot(json: Record<string, any>): Array<any> {
  const key = Object.keys(json).find((k) => k !== '_declaration')
  if (!key) {
    throw new Error('No root xml object found')
  }
  return Array.isArray(json[key]) ? json[key] : [json[key]]
}
