import api from '@flatfile/api'

export async function addSubmissionStatusField(sheetId: string): Promise<void> {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    if (
      !sheet.config.fields.some((field) => field.key === 'submissionStatus')
    ) {
      await api.sheets.addField(sheet.id, {
        key: 'submissionStatus',
        label: 'Submission Status',
        type: 'enum',
        readonly: true,
        config: {
          allowCustom: false,
          options: [
            { label: 'Rejected', value: 'rejected' },
            { label: 'Submitted', value: 'submitted' },
          ],
        },
      })
    }
  } catch (error) {
    console.error('Error adding rejection status field:', error)
    throw new Error('Error adding rejection status field')
  }
}
