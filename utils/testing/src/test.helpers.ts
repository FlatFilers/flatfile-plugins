import { Flatfile, FlatfileClient } from '@flatfile/api'
import { PubSubDriver } from '@flatfile/listener-driver-pubsub'
import fetch from 'cross-fetch'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { TestListener } from './test.listener'

const api = new FlatfileClient()

/**
 * Retrieves the environment ID from the process environment.
 *
 * @returns The environment id string.
 */
export function getEnvironmentId(): string {
  return `${process.env.FLATFILE_ENVIRONMENT_ID}`
}

/**
 * Generates a new space on Flatfile with a unique name.
 *
 * @returns A Promise that resolves to created space data.
 */
export async function setupSpace(): Promise<Flatfile.spaces.Space> {
  const environmentId = getEnvironmentId()

  const { data: space } = await api.spaces.create({
    name: 'ci-space-' + Date.now(),
    environmentId,
    autoConfigure: true,
  })

  return space
}

export async function deleteSpace(spaceId: string): Promise<Flatfile.Success> {
  return await api.spaces.delete(spaceId)
}

export function setupDriver() {
  const environmentId = getEnvironmentId()
  if (!environmentId) {
    throw new Error('environmentId is not defined')
  }

  return new PubSubDriver(environmentId)
}

/**
 * Establishes a connection to a PubSub channel and binds a listener to it.
 *
 * @param listener - The listener instance to bind to the channel.
 */
export function streamEvents(listener: TestListener) {
  const driver = setupDriver()

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)
  })

  afterAll(() => {
    driver.shutdown()
  })
}

/**
 * Sets up a TestListener object that maintains a count of the events it has received.
 *
 * @returns The newly created TestListener object.
 */
export function setupListener(): TestListener {
  const listener = new TestListener()
  streamEvents(listener)
  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })
  return listener
}

/**
 * Creates a new workbook object with given Space ID and fields.
 *
 * @param spaceId - The space ID where the workbook will be created.
 * @param fields - The list of properties or field keys for the workbook.
 * @param constraints - an optional list of constraints to add to the sheet
 * @returns A Promise that resolves to created workbook data.
 */
export async function setupSimpleWorkbook(
  spaceId: string,
  fields: Array<Flatfile.Property | string>,
  constraints: Flatfile.SheetConstraint[] = []
): Promise<Flatfile.Workbook> {
  const res = await api.workbooks.create({
    name: 'ci-wb-' + Date.now(),
    spaceId: spaceId,
    environmentId: getEnvironmentId(),
    sheets: [
      {
        name: 'test',
        slug: 'test',
        fields: fields.map((field) =>
          typeof field === 'string' ? { key: field, type: 'string' } : field
        ),
        constraints,
      },
    ],
  })
  return res.data
}

/**
 * Retrieves the records from a sheet with a specific ID.
 *
 * @param sheetId - The sheet ID where the records will be retrieved.
 * @returns A Promise that resolves to the array of records.
 */
export async function getRecords(sheetId: string) {
  const {
    data: { records },
  } = await api.records.get(sheetId)
  return records
}

/**
 * Creates records in a given sheet.
 *
 * @param sheetId - The sheet ID where the records will be created.
 * @param records - The array of records to be created.
 */
export async function createRecords(
  sheetId: string,
  records: Array<Record<string, any>>
) {
  const url = `${process.env.AGENT_INTERNAL_URL}/v1/sheets/${sheetId}/records`
  const modifiedRecords = records.map((r) =>
    Object.keys(r).reduce((acc: Record<string, any>, k) => {
      acc[k] = { value: r[k] }
      return acc
    }, {})
  )

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(modifiedRecords),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
      'X-Force-Hooks': 'true',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  } else {
    const data = await response.json()
    return data
  }
}

export async function getFiles(spaceId: string): Promise<Flatfile.File_[]> {
  const { data } = await api.files.list({ spaceId })
  return data
}
