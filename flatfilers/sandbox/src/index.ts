import type { FlatfileListener } from '@flatfile/listener'
import { HTMLTableExtractor } from '@flatfile/plugin-extract-html-table'
import { currencyConverterPlugin } from '@flatfile/plugin-convert-currency'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { fakerPlugin } from '@flatfile/plugin-import-faker'

export default async function (listener: FlatfileListener) {
  listener.use(HTMLTableExtractor())

  listener.use(
    currencyConverterPlugin({
      sheetSlug: 'currency-converter',
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      amountField: 'amount',
      convertedAmountField: 'convertedAmount',
      exchangeRateField: 'exchangeRate',
    })
  )
  listener.use(fakerPlugin({ job: 'sheet:generateExampleRecords' }))
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'Currency Converter',
              slug: 'currency-converter',
              fields: [
                {
                  key: 'amount',
                  type: 'number',
                  label: 'Amount',
                },
                {
                  key: 'convertedAmount',
                  type: 'number',
                  label: 'Converted Amount',
                },
                {
                  key: 'exchangeRate',
                  type: 'number',
                  label: 'Exchange Rate',
                },
              ],
            },
            {
              name: 'People',
              slug: 'people',
              fields: [
                {
                  key: 'firstName',
                  type: 'string',
                  label: 'First Name',
                },
                {
                  key: 'lastName',
                  type: 'string',
                  label: 'Last Name',
                },
                {
                  key: 'email',
                  type: 'string',
                  label: 'Email',
                },
                {
                  key: 'phone',
                  type: 'string',
                  label: 'Phone',
                },
                {
                  key: 'address',
                  type: 'string',
                  label: 'Address',
                },
                {
                  key: 'city',
                  type: 'string',
                  label: 'City',
                },
                {
                  key: 'state',
                  type: 'string',
                  label: 'State',
                },
                {
                  key: 'zip',
                  type: 'string',
                  label: 'Zip',
                },
                {
                  key: 'country',
                  type: 'string',
                  label: 'Country',
                },
                {
                  key: 'birthday',
                  type: 'date',
                  label: 'Birthday',
                },
              ],
              actions: [
                {
                  operation: 'generateExampleRecords',
                  label: 'Generate Example Records',
                  primary: false,
                  mode: 'foreground',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    })
  )
}
