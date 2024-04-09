import type { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { handleCreateConnectedWorkbooks } from './create.workbook'
import { handleConnectedWorkbookSync } from './sync.workbook'

export default function mergePlugin() {
  return (listener: FlatfileListener) => {
    // The `space:createConnectedWorkbook` job is fired when a Merge connection has been made in the UI.
    // `handleCreateConnectedWorkbooks()` creates the connected workbook mirroring the Merge schema.
    listener.use(
      jobHandler(
        'space:createConnectedWorkbook',
        handleCreateConnectedWorkbooks()
      )
    )
    // The `workbook:syncConnectedWorkbook` job syncs the connected workbook and can be triggered by clicking
    // the sync button.
    listener.use(
      jobHandler(
        'workbook:syncConnectedWorkbook',
        handleConnectedWorkbookSync()
      )
    )
  }
}
