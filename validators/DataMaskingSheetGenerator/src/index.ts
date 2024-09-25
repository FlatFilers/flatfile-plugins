import { FlatfileListener, FlatfileRecord } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'
import crypto from 'crypto'

interface MaskingRule {
  type: 'hash' | 'partial' | 'tokenize' | 'pii'
  options?: {
    showLastDigits?: number
    tokenLength?: number
    piiType?: string
  }
}

const defaultMaskingRules: { [key: string]: MaskingRule } = {
  email: { type: 'hash' },
  phone: { type: 'partial', options: { showLastDigits: 4 } },
  ssn: { type: 'partial', options: { showLastDigits: 4 } },
  creditCard: { type: 'partial', options: { showLastDigits: 4 } },
  name: { type: 'tokenize', options: { tokenLength: 8 } },
  address: { type: 'pii', options: { piiType: 'address' } },
}

export default function DataMaskingSheetGenerator(listener: FlatfileListener) {
  listener.use(
    recordHook(
      'records:created',
      async (record: FlatfileRecord, event: any) => {
        const sheetId = event.context.sheetId
        const workbookId = event.context.workbookId
        const columnsToMask = event.payload.columnsToMask || []
        const maskingRules = {
          ...defaultMaskingRules,
          ...event.payload.maskingRules,
        }

        await createMaskedSheet(
          sheetId,
          columnsToMask,
          maskingRules,
          workbookId
        )

        return record
      }
    )
  )
}

async function createMaskedSheet(
  sourceSheetId: string,
  columnsToMask: string[],
  maskingRules: { [key: string]: MaskingRule },
  workbookId: string
): Promise<void> {
  try {
    const sourceSheet = await api.sheets.get(sourceSheetId)
    const newSheet = await api.sheets.create({
      workbookId,
      name: `${sourceSheet.data.name} (Masked)`,
      fields: sourceSheet.data.fields,
    })

    const records = await api.records.get(sourceSheetId)
    const valueCache: { [key: string]: string } = {}
    const maskedRecords = records.data.map((record: FlatfileRecord) => {
      const maskedRecord: FlatfileRecord = { ...record }
      columnsToMask.forEach((column) => {
        if (maskedRecord.values[column]) {
          const cacheKey = `${column}:${maskedRecord.values[column]}`
          if (!valueCache[cacheKey]) {
            try {
              valueCache[cacheKey] = maskValue(
                maskedRecord.values[column],
                maskingRules[column]
              )
            } catch (error) {
              console.error(`Error masking value in column ${column}:`, error)
              valueCache[cacheKey] = '[MASKING_ERROR]'
            }
          }
          maskedRecord.values[column] = valueCache[cacheKey]
        }
      })
      return maskedRecord
    })

    await api.records.insert(newSheet.data.id, maskedRecords)
    await addMaskingMetadata(newSheet.data.id, columnsToMask, maskingRules)
  } catch (error) {
    console.error('Error creating masked sheet:', error)
  }
}

function maskValue(value: any, rule: MaskingRule): string {
  try {
    switch (rule.type) {
      case 'hash':
        return hashValue(value)
      case 'partial':
        return partialMask(value, rule.options?.showLastDigits || 4)
      case 'tokenize':
        return tokenize(value, rule.options?.tokenLength || 8)
      case 'pii':
        return maskPII(value, rule.options?.piiType)
      default:
        return '*'.repeat(String(value).length)
    }
  } catch (error) {
    console.error('Error in maskValue:', error)
    throw new Error(
      `Unsupported data type or masking failure: ${error.message}`
    )
  }
}

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function partialMask(value: string, showLastDigits: number): string {
  const masked = '*'.repeat(Math.max(0, value.length - showLastDigits))
  return masked + value.slice(-showLastDigits)
}

function tokenize(value: string, tokenLength: number): string {
  return crypto.randomBytes(tokenLength / 2).toString('hex')
}

function maskPII(value: string, piiType?: string): string {
  // Implement PII masking logic based on the piiType
  return '[MASKED_PII]'
}

async function addMaskingMetadata(
  sheetId: string,
  columnsToMask: string[],
  maskingRules: { [key: string]: MaskingRule }
) {
  const metadata = {
    isMasked: true,
    maskedColumns: columnsToMask,
    maskingRules: maskingRules,
    maskingDate: new Date().toISOString(),
  }

  try {
    await api.sheets.update(sheetId, {
      metadata: {
        masking: metadata,
      },
    })
  } catch (error) {
    console.error('Error adding masking metadata:', error)
  }
}
