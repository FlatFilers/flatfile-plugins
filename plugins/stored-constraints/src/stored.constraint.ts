import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import {
  applyConstraintToRecord,
  crossEach,
  getStoredConstraints,
  getFields,
  getSheet,
  getValidator,
  hasStoredConstraints,
  getAppConstraints,
} from './utils'
import validator from 'validator'
import * as countryStateCity from 'country-state-city'
import { DateTime } from 'luxon'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { FlatfileRecord } from '@flatfile/hooks'

const deps = { validator, countryStateCity, luxon: DateTime, }

export interface Constraint {
  validator: string
  function: string
  type?: string
}

async function getValidators(event: FlatfileEvent): Promise<Constraint[]> {
  const constraints = await getAppConstraints(event.context.appId)
  return constraints.data.map((c: any) => {
    return {
      validator: c.validator,
      function: c.function,
    }
  })
}

export function storedConstraint() {
  return (listener: FlatfileListener) => {
    listener.use(
      bulkRecordHook('**', async (records: FlatfileRecord[], event: FlatfileEvent) => {
        const sheet = await getSheet(event)
        const storedConstraintFields = getFields(sheet).filter(hasStoredConstraints)
        const validators = await getValidators(event)

        crossEach([records, storedConstraintFields], (record: FlatfileRecord, field: any) => {
          getStoredConstraints(field.constraints).forEach(
            async ({ validator }: { validator: string }) => {
              const constraint = await getValidator(validators, validator)
              if (constraint) {
                applyConstraintToRecord(constraint, record, field, deps, sheet)
              }
            },
          )
        })
      }),
    )
  }
}