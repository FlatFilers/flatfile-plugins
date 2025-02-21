import { Flatfile, FlatfileClient } from '@flatfile/api'

const api = new FlatfileClient()

export const dataChecklist = async (spaceId: Flatfile.SpaceId) => {
  const { data: workbooks } = await api.workbooks.list({ spaceId })

  let body = `<div class="my-doc">\n`

  for (const workbook of workbooks) {
    const { data: sheets } = await api.sheets.list({ workbookId: workbook.id })
    body += `  <h2>${workbook.name}</h2>`

    for (const sheet of sheets) {
      const fields = sheet.config.fields
      const fieldTable = fields
        .map((field) => {
          const constraints = field.constraints
            ?.map(
              (constraint) =>
                `<span style="color: #d97a71; background-color: #fff0ef; padding: 2px 6px; border-radius: 5px; margin-left: 8px;">${constraint.type}</span>`
            )
            .join('')
          return `
  <tr>
    <td style="padding:8px; border-bottom:1px solid #f3f2f2;">${field.label}${constraints ?? ''}</td>
    <td style="padding:8px; border-bottom:1px solid #f3f2f2;"><span style="color: #2e424b; background-color: #f0f0f0; padding: 2px 6px; border-radius: 5px;">${field.type}</span></td>
    <td style="padding:8px; border-bottom:1px solid #f3f2f2;">${field.description || ''}</td>
  </tr>`
        })
        .join('')

      body += `
<h3>${sheet.name}</h3>
<table style="width:100%; border-collapse: collapse;">
<thead>
  <tr>
    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd; width: 25%;">Field Name</th>
    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd; width: 10%;">Data Type</th>
    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd; width: 65%;">Description</th>
  </tr>
</thead>
<tbody>${fieldTable}
</tbody>
</table>`
    }
  }

  body += `\n</div>`

  const { data: documents } = await api.documents.list(spaceId)
  const checklistDocument = documents.find(
    (document) => document.title === 'Data Checklist'
  )
  if (checklistDocument) {
    await api.documents.update(spaceId, checklistDocument.id, {
      title: `Data Checklist`,
      body,
    })
  } else {
    await api.documents.create(spaceId, {
      title: `Data Checklist`,
      body,
    })
  }
}
