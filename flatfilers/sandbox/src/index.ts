import type { FlatfileListener } from '@flatfile/listener'
import { HTMLTableExtractor } from '@flatfile/plugin-extract-html-table'
import { currencyConverterPlugin } from '@flatfile/plugin-convert-currency'
import { configureSpace } from '@flatfile/plugin-space-configure'

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
          ],
        },
      ],
    })
  )
}
