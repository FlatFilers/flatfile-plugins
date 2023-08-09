/**
 * Shim target for events that don't have a target
 *
 * @param event
 */
export function shimTarget(event: any) {
  const actionName = event.payload?.['actionName']
  const sheetSlug = event.context.sheetSlug
  const domain =
    sheetSlug && event.domain === 'workbook' ? 'sheet' : event.domain
  const actionTarget = `${domain}(${actionName?.split(':')[0]})`

  return domain === 'file'
    ? 'space(*)'
    : actionName
    ? actionTarget
    : `sheet(${sheetSlug?.split('/').pop()})` // workbook(PrimaryCRMWorkbook)
}
