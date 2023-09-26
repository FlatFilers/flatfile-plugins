import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { MergeClient, MergeEnvironment } from '@mergeapi/merge-node-client'

type MergeCategory =
  | 'hris'
  | 'ats'
  | 'accounting'
  | 'ticketing'
  | 'crm'
  | 'marketing_automation'
  | 'file_storage'

export default function mergePlugin(category: MergeCategory) {
  return async (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        'workbook:syncActionFg',
        async (event: FlatfileEvent, tick) => {
          const { spaceId, environmentId } = event.context

          const merge = await getMergeClient(spaceId, environmentId)
          const sheetConfig = await getSheets(category, merge)
          const config: Flatfile.CreateWorkbookConfig = {
            name: 'Merge.dev',
            sheets: sheetConfig,
          }

          const {
            data: { sheets },
          } = await api.workbooks.create({
            spaceId,
            environmentId,
            ...config,
          })

          const employeeSheet = sheets.find(
            (sheet) => sheet.name === 'Employees'
          )
          if (!employeeSheet) {
            throw new Error('Employees sheet not found')
          }

          let employees
          do {
            employees = await merge.hris.employees.list({
              cursor: employees?.next,
            })
            await api.records.insert(
              employeeSheet.id,
              mapRecords(employees.results)
            )
          } while (employees.next)

          return { info: 'Synced!' }
        }
      )
    )
  }
}

async function getMergeClient(
  spaceId: string,
  environmentId: string
): Promise<MergeClient> {
  const getSpaceEnvSecret = async (
    name: string
  ): Promise<string | undefined> => {
    const secrets: Flatfile.SecretsResponse = await api.secrets.list({
      spaceId,
      environmentId,
    })
    return secrets.data.find((secret) => secret.name === name)?.value
  }

  const apiKey = await getSpaceEnvSecret('MERGE_TEST_ACCESS_KEY')
  const accountToken = await getSpaceEnvSecret('MERGE_X_ACCOUNT_TOKEN')

  if (!apiKey || !accountToken) {
    throw new Error('Missing Merge API key or account token')
  }

  return new MergeClient({
    environment: MergeEnvironment.Production,
    apiKey,
    accountToken,
  })
}

const mergeTables = {
  hris: [
    {
      slug: 'employees',
      name: 'Employees',
    },
    // {
    //   slug: 'companies',
    //   name: 'Companies',
    // },
    // {
    //   slug: 'locations',
    //   name: 'Locations',
    // },
  ],
  ats: [],
  accounting: [],
  ticketing: [],
  crm: [],
  marketing_automation: [],
  file_storage: [],
}

async function getSheets(
  category: string,
  merge: MergeClient
): Promise<Flatfile.SheetConfig[]> {
  return await Promise.all(
    mergeTables[category].map(async (table) => {
      if (typeof merge[category][table.slug].metaPostRetrieve === 'function') {
        const meta = await merge[category][table.slug].metaPostRetrieve()
        const model = meta.requestSchema.properties['model']
        const sheetConfig = getSheetConfig(table.name, model)
        return sheetConfig
      }
    })
  )
}

function getSheetConfig(
  name: string,
  schema: Record<string, any>
): Flatfile.SheetConfig {
  const requiredFields: string[] = schema.required
  const properties: Record<string, any> = schema.properties
  const fields: Flatfile.Property[] = []

  for (const [key, value] of Object.entries(properties)) {
    let field: Flatfile.BaseProperty = {
      key: key,
      label: value.title,
      description: value.description,
      constraints: requiredFields.includes(key)
        ? [
            {
              type: 'required',
            },
          ]
        : [],
    }

    if (value.type === 'string') {
      if (value.enum) {
        fields.push({
          ...field,
          type: 'enum',
          config: {
            options: value.enum.map((e: string) => ({
              label: formatString(e),
              value: e,
            })),
          },
        })
      } else if (value.format === 'date-time') {
        fields.push({
          ...field,
          type: 'date',
        })
      } else {
        fields.push({
          ...field,
          type: 'string',
        })
      }
    }
  }

  return {
    name: name,
    fields: fields,
  }
}

function formatString(str) {
  return str
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function mapRecords(records: Record<string, any>): Flatfile.RecordData[] {
  return Object.values(records).map((record) => {
    const mappedRecord: Flatfile.RecordData = {}
    for (let key in record) {
      mappedRecord[key] = { value: record[key]?.toString() }
    }
    return mappedRecord
  })
}
