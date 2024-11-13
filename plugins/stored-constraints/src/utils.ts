import { FlatfileClient } from '@flatfile/api'
import * as _ from 'lodash'
import type { FlatfileEvent } from '@flatfile/listener'
import { Constraint } from  './stored.constraint'

const api = new FlatfileClient()

export const getSheet = (event: FlatfileEvent ) => api.sheets.get(event.context.sheetId)

export const getFields = ({ data }) => data.config.fields

export const getStoredConstraints = (constraints: Constraint[]) => constraints?.filter((c) => c.type == 'stored')

export const hasStoredConstraints = (field) =>
  getStoredConstraints(field.constraints || []).length > 0

export const getValidator = (v, n) => v.find((w) => w.validator === n)
export const applyConstraintToRecord = (constraint: Constraint, record, field, deps, sheet) => {
  const storedConstraint = field.constraints?.find((fieldConstraint) => fieldConstraint.validator === constraint.validator)
  const { config = {} } = storedConstraint || {}
  const constraintFn = constraint.function.startsWith('function')
    ? constraint.function.includes('function constraint')
      ? eval(
          '(' + constraint.function.replace('function constraint', 'function') + ')',
        )
      : eval('(' + constraint.function + ')')
    : eval(constraint.function)

  constraintFn(record.get(field.key), field.key, { config, record, deps, sheet })
}
export const crossProduct = (...a) =>
  a.reduce((u, c) => _.flatMap(u, (a) => c.map((b) => a.concat(b))), [[]])
export const crossEach = (a, cb) => crossProduct(...a).forEach((p) => cb(...p))
export const getAppConstraints = (a) =>
  api.apps.getConstraints(a, { includeBuiltins: true })
