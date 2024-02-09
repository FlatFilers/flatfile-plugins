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

export function getSheetConstraints(
  schema: Flatfile.SheetConfig,
  validator: string
) {
  return (schema.constraints?.filter(
    (c) =>
      // todo: remove this `|| c.config.validator` once API bug is fixed
      c.type === 'external' && (c.validator || c.config.validator) === validator
  ) || []) as Array<Flatfile.SheetConstraint.External>
}
