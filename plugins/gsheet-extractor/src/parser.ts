import { RecordData } from '@flatfile/api/api'
import { WorkbookCapture } from '@flatfile/util-extractor'
import { google } from 'googleapis'

type GsheetFile = {
  doc_id: string
  resource_key: string // probably empty
  email: string
}

const sheets = google.sheets('v4')

export async function parseBuffer(
  buffer: Buffer,
  options: {
    getSecret: (key: string) => Promise<string>
    sheetRange?: string;
  }
): Promise<WorkbookCapture> {
  const serviceAccount = await getServiceAccount(options)

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const data = JSON.parse(buffer.toString()) as GsheetFile

  const sheetsResponse = await sheets.spreadsheets.get({
    auth,
    spreadsheetId: data.doc_id,
  })

  const workbooks: WorkbookCapture = {}

  for (const sheet of sheetsResponse.data.sheets) {
    const title = sheet.properties.title

    const valuesResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: data.doc_id,
      range: options.sheetRange ? `${title}!${options.sheetRange}` : title,
    })

    const headers: string[] = []

    for (let header of valuesResponse.data.values[0]) {
      let renameCount = 0

      // Empty headers can happen, use "EMPTY" instead when encountered.
      if (header === '') {
        header = 'EMPTY'
      }

      // Make sure we do not have duplicate header names
      while (headers.includes(header)) {
        if (renameCount === 0) {
          header = `${header}--${renameCount + 1}`
        } else {
          header = `${header.slice(0, header.length - 1)}${renameCount + 1}`
        }

        renameCount++
      }

      headers.push(header)
    }

    const values: RecordData[] = []

    for (const row of valuesResponse.data.values.slice(1)) {
      const value: RecordData = {}

      for (let index = 0; index < row.length; index++) {
        value[headers[index]] = {
          value: row[index],
        }
      }

      values.push(value)
    }

    workbooks[title] = {
      headers,
      data: values,
    }
  }

  return workbooks
}

async function getServiceAccount(options: {
  getSecret: (key: string) => Promise<string>
}) {
  const [
    projectId,
    privateKeyId,
    privateKey1,
    privateKey2,
    clientEmail,
    clientId,
    clientCertUrl,
  ] = await Promise.all([
    options.getSecret('google-cloud-project-id'),
    options.getSecret('google-cloud-private-key-id'),
    // Flatfile secrets can "only" hold 1024 characters, so had to cut it in half.
    options.getSecret('google-cloud-private-key-1'),
    options.getSecret('google-cloud-private-key-2'),
    options.getSecret('google-cloud-client-email'),
    options.getSecret('google-cloud-client-id'),
    options.getSecret('google-cloud-client-cert-url'),
  ])

  return {
    type: 'service_account',
    project_id: projectId,
    private_key_id: privateKeyId,
    // Seems that flatfile are escaping newlines in a weird way, so we remove it again.
    private_key: (privateKey1 + privateKey2).replace(/\\n/g, '\n'),
    client_email: clientEmail,
    client_id: clientId,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: clientCertUrl,
    universe_domain: 'googleapis.com',
  }
}
