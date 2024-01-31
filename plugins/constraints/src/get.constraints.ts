import { Flatfile } from '@flatfile/api'

export function getConstraints(
  schema: Flatfile.SheetConfig,
  validator: string
) {
  return schema.fields.reduce((acc, f) => {
    f.constraints?.forEach((c) => {
      if (c.type === 'external' && c.validator === validator) {
        acc.push([f, c])
      }
    })
    return acc
  }, [] as Array<[Flatfile.Property, Flatfile.Constraint.External]>)
}
