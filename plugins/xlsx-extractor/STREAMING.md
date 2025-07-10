# Excel Extractor v2 Streaming Support

The Excel Extractor now automatically uses the v2 Flatfile API for streaming record writes, providing better performance for large Excel files with no configuration required.

## Automatic Streaming

The plugin now automatically uses v2 streaming for better performance:

```javascript
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'

const plugin = ExcelExtractor({
  // All existing options work normally
  // Streaming is automatically enabled
})
```

## Benefits

- **Memory Efficient**: Records are streamed rather than loaded all at once
- **Better Performance**: Uses the optimized v2 API endpoint automatically + single-pass parsing
- **Large File Support**: Can handle larger Excel files without memory issues
- **Transparent**: No configuration changes needed

## Backwards Compatibility

- **Seamless Upgrade**: All existing code continues to work without any changes
- **Automatic Fallback**: Falls back to v1 API if v2 is not available
- **No Breaking Changes**: Plugin interface remains exactly the same

## Technical Details

The plugin automatically:
1. **Single-pass parsing**: Efficiently parses Excel files only once (no duplicate parsing)
2. **Streaming records**: Streams records as they're processed from Excel files  
3. **v2 API**: Uses the v2 `writeRawStreaming` API when available
4. **Format conversion**: Converts records from v1 format (`{field: {value: "data"}}`) to v2 format (`{field: "data"}`)
5. **Auto-fields**: Adds special v2 fields like `__s` (sheet ID) automatically
6. **Graceful fallback**: Falls back to v1 API if v2 streaming fails

## API Requirements

- **Recommended**: `@flatfile/api` version 1.18.0+ for v2 records API support
- **Fallback**: Works with older API versions by automatically falling back to v1
