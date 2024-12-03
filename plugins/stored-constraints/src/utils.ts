import { type Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileRecord } from '@flatfile/plugin-record-hook'
import { Constraint } from './stored.constraint'

const api = new FlatfileClient()

export const getSheet = async (
  event: FlatfileEvent
): Promise<Flatfile.SheetResponse> =>
  await api.sheets.get(event.context.sheetId)

export const getFields = ({ data }: { data: Flatfile.Sheet }) =>
  data.config.fields

export const getStoredConstraints = (
  constraints: Flatfile.Constraint[]
): Flatfile.StoredConstraint[] =>
  constraints?.filter((c) => c.type === 'stored')

export const hasStoredConstraints = (field: Flatfile.Property) =>
  getStoredConstraints(field.constraints || []).length > 0

export const getValidator = (
  v: Constraint[],
  n: string
): Constraint | undefined => v.find((w) => w.validator === n)

export const applyConstraintToRecord = (
  constraint: Constraint,
  record: FlatfileRecord,
  field: Flatfile.Property,
  deps: any,
  sheet: Flatfile.SheetResponse
) => {
  const storedConstraint = getStoredConstraints(field.constraints || []).find(
    (fieldConstraint) => fieldConstraint.validator === constraint.validator
  )
  const { config = {} } = storedConstraint || {}
  const constraintFn = constraint.function.startsWith('function')
    ? constraint.function.includes('function constraint')
      ? eval(
          '(' +
            constraint.function.replace('function constraint', 'function') +
            ')'
        )
      : eval('(' + constraint.function + ')')
    : eval(constraint.function)

  constraintFn(record.get(field.key), field.key, {
    config,
    record,
    deps,
    sheet,
  })
}
export const crossProduct = <T>(...a: T[][]): T[][] =>
  a.reduce((u, c) => u.flatMap((x) => c.map((b) => [...x, b])), [[]])
export const crossEach = <T>(a: T[][], cb: (...args: T[]) => void): void =>
  crossProduct(...a).forEach((p) => cb(...p))
export const getAppConstraints = async (
  a: Flatfile.AppId
): Promise<Flatfile.ConstraintsResponse> =>
  await api.apps.getConstraints(a, { includeBuiltins: true })
