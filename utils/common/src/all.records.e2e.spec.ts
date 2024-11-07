import { Flatfile, FlatfileClient } from '@flatfile/api'
import { getEnvironmentId, setupSpace } from '@flatfile/utils-testing'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getRecordsRaw, processRecords } from './all.records'

const api = new FlatfileClient()

describe('all.records', () => {
  describe('processRecords', () => {
    let spaceId: string
    let emptySheetId: string
    let populatedSheetId: string

    beforeAll(async () => {
      const space = await setupSpace()
      spaceId = space.id

      const fields = ['name', 'email', 'notes']
      const { data: workbook } = await api.workbooks.create({
        name: 'ci-wb-' + Date.now(),
        spaceId: spaceId,
        environmentId: getEnvironmentId(),
        sheets: [
          {
            name: 'Empty Records Sheet',
            slug: 'empty',
            fields: fields.map((field) =>
              typeof field === 'string' ? { key: field, type: 'string' } : field
            ),
          },
          {
            name: 'Populated Records Sheet',
            slug: 'populated',
            fields: fields.map((field) =>
              typeof field === 'string' ? { key: field, type: 'string' } : field
            ),
          },
        ],
      })

      const findSheetId = (slug: string) => {
        return workbook.sheets?.find((sheet) => sheet.config.slug === slug)?.id
      }

      emptySheetId = findSheetId('empty') as string
      populatedSheetId = findSheetId('populated') as string

      const generateRecords = (length: number) => {
        const records: Flatfile.RecordData[] = []
        for (let i = 0; i < length; i++) {
          records.push({
            name: { value: 'John Doe' },
            email: { value: 'john@doe.com' },
            notes: { value: 'Some notes' },
          })
        }
        return records
      }

      await api.records.insert(populatedSheetId, generateRecords(3000))
    })

    afterAll(async () => {
      await api.spaces.delete(spaceId)
    })

    it('should call callback function', async () => {
      const callback = vi.fn()

      await processRecords(emptySheetId, callback)
      expect(callback).toHaveBeenCalled()

      callback.mockClear()

      await processRecords(populatedSheetId, callback)
      expect(callback).toHaveBeenCalled()
    })

    it('should return results', async () => {
      const callback = vi.fn((records) => records.length)

      const emptyResults = await processRecords(emptySheetId, callback)
      expect(emptyResults).toEqual([0])

      const populatedResults = await processRecords(populatedSheetId, callback)
      expect(populatedResults).toEqual([3000])
    })

    it('should filter records by "valid" status', async () => {
      const callback = vi.fn((records) => records.length)

      const emptyResults = await processRecords(emptySheetId, callback, {
        filter: 'valid',
      })
      expect(emptyResults).toEqual([0])

      const populatedResults = await processRecords(
        populatedSheetId,
        callback,
        {
          filter: 'valid',
        }
      )
      expect(populatedResults).toEqual([3000])
    })

    it('should filter records by "error" status', async () => {
      const callback = vi.fn((records) => records.length)

      const emptyResults = await processRecords(emptySheetId, callback, {
        filter: 'error',
      })
      expect(emptyResults).toEqual([0])

      const populatedResults = await processRecords(
        populatedSheetId,
        callback,
        {
          filter: 'error',
        }
      )
      expect(populatedResults).toEqual([0])
    })

    it('should fetch records with custom page size', async () => {
      const callback = vi.fn((records) => records.length)

      const emptyResults = await processRecords(emptySheetId, callback, {
        pageSize: 500,
      })
      expect(emptyResults).toEqual([0])
      expect(callback).toHaveBeenCalledTimes(1)

      const populatedResults = await processRecords(
        populatedSheetId,
        callback,
        {
          pageSize: 500,
        }
      )
      expect(populatedResults).toEqual([500, 500, 500, 500, 500, 500])
      expect(callback).toHaveBeenCalledTimes(7)
    })

    it('should return no results', async () => {
      await expect(getRecordsRaw(emptySheetId)).resolves.toEqual([])

      await expect(
        getRecordsRaw(emptySheetId, { pageNumber: 2 })
      ).resolves.toEqual([])
    })

    it('should return results', async () => {
      await expect(
        getRecordsRaw(populatedSheetId, { pageNumber: 1 })
      ).resolves.toHaveLength(3000)
    })

    it('should return results filtered by record ids', async () => {
      const records = (await getRecordsRaw(populatedSheetId, {
        pageSize: 10,
      })) as Flatfile.Record_[]
      const recordIds = records.map((record) => record.id)

      await expect(
        getRecordsRaw(populatedSheetId, { ids: recordIds })
      ).resolves.toHaveLength(10)
    })

    it('should throw error', async () => {
      const sheetId = 'badid'
      await expect(getRecordsRaw(sheetId)).rejects.toThrow(
        `Reading 1 of ${sheetId} failed.`
      )
    })
  })
})
