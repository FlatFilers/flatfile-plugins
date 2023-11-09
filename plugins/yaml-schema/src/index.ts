import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { generateSetup } from '@flatfile/plugin-convert-json-schema'
import { configureSpace } from '@flatfile/plugin-space-configure'
import type {
  ModelToSheetConfig,
  PartialWorkbookConfig,
} from '@flatfile/util-fetch-schema'
import { getSchemas } from '@flatfile/util-fetch-schema/src'
import jsYaml from 'js-yaml'

export function configureSpaceWithYamlSchema(
  models?: ModelToSheetConfig[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  },
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress?: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    const schemas = await getSchemas(models)
    listener.use(
      configureSpace(
        await generateSetup(
          models,
          schemas.map((schema) => jsYaml.load(schema)),
          options
        ),
        callback
      )
    )
  }
}
