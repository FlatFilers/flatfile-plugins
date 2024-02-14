import { WorkbookCapture } from '@flatfile/util-extractor'
import { mapValues } from 'remeda'
import toJSON from 'xml-json-format'

export function parseBuffer(
  buffer: Buffer,
  options?: {
    separator?: string
    attributePrefix?: string
    transform?: (row: Record<string, any>) => Record<string, any>
  }
): WorkbookCapture {
  const transform = options?.transform || ((value) => value)
  const data = xmlToJson(buffer.toString())
  const headers = headersFromObjectList(data)

  const sheetName = 'Sheet1'
  return {
    [sheetName]: {
      headers,
      data: data.map((row) => {
        return mapValues(transform(row), (value) => ({ value }))
      }),
    },
  } as WorkbookCapture
}

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

export function headersFromObjectList(
  arr: Array<Record<string, any>>
): Array<string> {
  const keys: Record<string, true> = {}
  arr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      keys[key] = true
    })
  })
  return Object.keys(keys)
}

function flattenAttributes(obj: Record<string, any>): Record<string, any> {
  if (obj && '_attributes' in obj) {
    const attributes = mapObject(obj._attributes, (k, v) => [`#${k}`, v])
    delete obj._attributes
    return { ...obj, ...attributes }
  }
  return obj
}

function mapObject(
  obj: Record<string, any>,
  fn: (k: string, v: any) => [string, any]
): Record<string, any> {
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((k) => {
    const [key, value] = fn(k, obj[k])
    result[key] = value
  })
  return result
}

function flattenObject(
  input: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const obj = flattenAttributes(input)
  if (!obj) return {}
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((k) => {
    const pre = prefix
      ? prefix + (k.startsWith('#') || k === '_text' ? '' : '/')
      : ''
    if (typeof obj[k] === 'object') {
      Object.assign(result, flattenObject(obj[k], pre + k))
    } else {
      result[pre + (k === '_text' && pre ? '' : k)] = obj[k]
    }
  })
  return result
}

export function findRoot(json: Record<string, any>): Array<any> {
  const key = Object.keys(json).find((k) => k !== '_declaration')
  if (!key) {
    throw new Error('No root xml object found')
  }
  return Array.isArray(json[key]) ? json[key] : [json[key]]
}
