import type { Flatfile } from '@flatfile/api'
import type { FlatfileRecord } from '@flatfile/hooks'
import type { FlatfileEvent } from '@flatfile/listener'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import * as countryStateCity from 'country-state-city'
import { DateTime } from 'luxon'
import validator from 'validator'
import {
  applyConstraintToRecord,
  crossEach,
  getAppConstraints,
  getFields,
  getSheet,
  getStoredConstraints,
  getValidator,
  hasStoredConstraints,
} from './utils'

const deps = { validator, countryStateCity, luxon: DateTime }

export interface Constraint {
  validator: string
  function: string
  type?: string
}

async function getValidators(event: FlatfileEvent): Promise<Constraint[]> {
  const constraints = await getAppConstraints(event.context.appId)
  return constraints.data.map((c: Flatfile.ConstraintResource) => {
    return {
      validator: c.validator,
      function: c.function,
    }
  })
}

export function storedConstraint() {
  return bulkRecordHook(
    '**',
    async (records: FlatfileRecord[], event: FlatfileEvent) => {
      const sheet: Flatfile.SheetResponse = await getSheet(event)
      const storedConstraintFields =
        getFields(sheet).filter(hasStoredConstraints)
      const validators = await getValidators(event)
      crossEach(
        [records, storedConstraintFields],
        (record: FlatfileRecord, field: Flatfile.Property) => {
          getStoredConstraints(field.constraints).forEach(
            async ({ validator }: { validator: string }) => {
              const constraint = await getValidator(validators, validator)
              if (constraint) {
                try {
                  applyConstraintToRecord(constraint, record, field, deps, sheet)
                } catch(error) {
                  console.error(`Error executing constraint: ${error.message}`)
                }
              }
            }
          )
        }
      )
    }
  )
}
