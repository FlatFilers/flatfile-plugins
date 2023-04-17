import { SheetConfig } from '@flatfile/api'
import { Client, FlatfileVirtualMachine } from '@flatfile/listener'
import { FlatfileRecord } from '@flatfile/hooks'
import { recordHook } from '.'

const ExampleSheet: SheetConfig = {
  name: 'ExampleSheet',
  description: 'An example sheet showing a record hook',
  slug: 'example-record-hook-sheet',
  fields: [
    {
      key: 'firstName',
      label: 'First name',
      type: 'string',
    },
    {
      key: 'lastName',
      label: 'Last name',
      type: 'string',
    },
    {
      key: 'fullName',
      label: 'Full name',
      type: 'string',
    },
  ],
}

const example = Client.create((client) => {
  client.on('client:init', async (event) => {
    try {
      const environmentId = event.context.environmentId

      // Create Space
      const space = await client.api.addSpace({
        spaceConfig: {
          name: 'Record hook example space 11',
          environmentId,
        },
      })

      if (!space.data) return

      // Create Workbook
      const workbook = await client.api.addWorkbook({
        workbookConfig: {
          name: 'Record hook example workbook 11',
          spaceId: space.data.id,
          environmentId,
          sheets: [ExampleSheet],
        },
      })

      if (!workbook.data) return

      // Update Space with Workbook
      await client.api.updateSpaceById({
        spaceId: space.data.id,
        spaceConfig: {
          primaryWorkbookId: workbook.data.id,
          environmentId,
        },
      })
    } catch (e) {
      console.log(`error creating Space or Workbook: ${e}`)
    }
  })
})

example.use(
  recordHook('example-record-hook-sheet', (record: FlatfileRecord) => {
    const firstName = record.get('firstName')
    const lastName = record.get('lastName')
    if (firstName && lastName && !record.get('fullName')) {
      record.set('fullName', `${firstName} ${lastName}`)
      record.addComment(
        'fullName',
        'Full name was populated from first and last name.'
      )
    }
    return record
  })
)

const FlatfileVM = new FlatfileVirtualMachine()

example.mount(FlatfileVM)

export default example
