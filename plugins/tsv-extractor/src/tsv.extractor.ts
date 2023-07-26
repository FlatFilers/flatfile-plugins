import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'
export class TsvExtractor extends DelimiterExtractor {
  constructor(
    public event: { [key: string]: any },
    public options?: {
      //add if needed
    }
  ) {
    super(event, 'tab', 'tsv', options)
  }
}
