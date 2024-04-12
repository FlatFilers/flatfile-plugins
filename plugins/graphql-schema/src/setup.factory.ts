import type { FlatfileEvent } from '@flatfile/listener'
import type { Setup } from '@flatfile/plugin-space-configure'
import { generateWorkbook } from './generate.workbook'
import type { GraphQLSetupFactory } from './types'

export async function generateSetup(
  setupFactory: GraphQLSetupFactory,
  event?: FlatfileEvent
): Promise<Setup> {
  try {
    const workbooks = await Promise.all(
      setupFactory.workbooks.map((workbook) =>
        generateWorkbook(workbook, event)
      )
    )
    return {
      workbooks,
      space: setupFactory.space,
    }
  } catch (error) {
    console.error('Error generating workbook:', error)
    throw new Error('Error generating workbook')
  }
}
