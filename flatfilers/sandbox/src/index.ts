import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { exportDelimitedZip } from '@flatfile/plugin-export-delimited-zip'
import { type TickFunction } from '@flatfile/plugin-job-handler'
import { JSONExtractor } from '@flatfile/plugin-json-extractor'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import {
  configureSpace,
  createDataChecklist,
} from '@flatfile/plugin-space-configure'
import { storedConstraint } from '@flatfile/plugin-stored-constraints'
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
import { contacts } from './sheets/contacts'

export default async function (listener: FlatfileListener) {
  listener.use(storedConstraint())
  listener.use(
    ExcelExtractor({
      rawNumbers: true,
      headerDetectionOptions: {
        algorithm: 'dataRowAndSubHeaderDetection',
      },
    })
  )

  listener.use(
    bulkRecordHook(
      'contacts',
      async (records) => {
        try {
          let firstRecord = records[0]
          firstRecord.set('lastName', 'Jane')
          return records
        } catch (error) {
          throw error
        }
      },
      { debug: true }
    )
  )
  listener.use(
    configureSpace(
      {
        workbooks: [
          {
            name: 'Sandbox',
            sheets: [
              {
                name: 'Sales',
                slug: 'sales',
                fields: [
                  {
                    key: 'date',
                    type: 'string',
                    label: 'Date',
                    description: 'The date of the sale',
                    constraints: [
                      {
                        type: 'required',
                      },
                      {
                        type: 'unique',
                      },
                    ],
                  },
                  {
                    key: 'product',
                    type: 'string',
                    label: 'Product',
                    description: 'The product sold',
                    constraints: [
                      {
                        type: 'required',
                      },
                    ],
                  },
                  {
                    key: 'category',
                    type: 'string',
                    label: 'Category',
                    description: 'The category of the product',
                  },
                  {
                    key: 'region',
                    type: 'string',
                    label: 'Region',
                    description: 'The region of the sale',
                  },
                  {
                    key: 'salesAmount',
                    type: 'number',
                    label: 'Sales Amount',
                    description: 'The amount of the sale',
                  },
                ],
                actions: [
                  {
                    operation: 'generateExampleRecords',
                    label: 'Generate Example Records',
                    description:
                      'This custom action code generates example records using Anthropic.',
                    primary: false,
                    mode: 'foreground',
                  },
                ],
              },
              {
                name: 'Sales 2',
                slug: 'sales-2',
                fields: [
                  {
                    key: 'date',
                    type: 'string',
                    label: 'Date',
                  },
                  {
                    key: 'product',
                    type: 'string',
                    label: 'Product',
                  },
                  {
                    key: 'category',
                    type: 'string',
                    label: 'Category',
                  },
                  {
                    key: 'region',
                    type: 'string',
                    label: 'Region',
                  },
                  {
                    key: 'salesAmount',
                    type: 'number',
                    label: 'Sales Amount',
                  },
                ],
                actions: [
                  {
                    operation: 'export-external-api',
                    label: 'Export to External API',
                    description:
                      'This custom action code exports the records in the Sales sheet to an external API.',
                    primary: false,
                    mode: 'foreground',
                  },
                ],
              },
            ],
            actions: [
              {
                operation: 'export-delimited-zip',
                label: 'Export to Delimited ZIP',
                mode: 'foreground',
              },
            ],
          },
        ],
      },
      async (
        event: FlatfileEvent,
        _workbookIds: string[],
        _tick: TickFunction
      ) => {
        await createDataChecklist(event)
      }
    )
  )
}
