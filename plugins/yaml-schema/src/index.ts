import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { configureSpace } from '@flatfile/plugin-space-configure'
import type { ModelToSheetConfig, PartialWorkbookConfig } from './setup.factory'
import { generateSetup } from './setup.factory'

export function configureSpaceWithYamlSchema(
  models?: ModelToSheetConfig[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  },
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: TickFunction
  ) => any | Promise<any>
) {
  return configureSpace(() => generateSetup(models, options), callback)
}

export * from './setup.factory'
