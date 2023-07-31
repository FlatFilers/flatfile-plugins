# @flatfile/plugin-extractor-xml

This plugin lets you easily extract data from XML files.


## Get Started

Follow [this guide](https://flatfile.com/docs/plugins/extractors/xml-extractor) to learn how to use the plugin.

`listener.js`

```js
import { XMLExtractor } from '@flatfile/plugin-extractor-xml'

export default (listener) => {
  listener.use(XMLExtractor())
}
```

```js
import { XMLExtractor } from '@flatfile/plugin-extractor-xml'

export default (listener) => {
  listener.use(
    XMLExtractor({
      separator: '/',
      attributePrefix: '#',
      transform: (row: Record<string, any>) => {
      },
    })
  )
}
```

## Configuration

### `separator: string` (default `/`)

The separator to use when joining or flattening nested attributes.

#### Example with default `/` separator

```xml
<?xml version="1.0" encoding="utf-8" ?>
<root>
    <person>
        <name>John</name>
        <age>30</age>
        <country>
            <name>USA</name>
            <code>US</code>
        </country>
    </person>
</root>
```

```json
[
  {
    "name": "John",
    "age": "30",
    "country/name": "USA",
    "country/code": "US"
  }
]
```

## `attributePrefix: string` (default `#`)

The prefix to use when flattening attributes of XML tags.

#### Example with default `#` prefix

```xml
<?xml version="1.0" encoding="utf-8" ?>
<root>
    <person>
        <name>John</name>
        <age>30</age>
        <country code="US">USA</country>
    </person>
</root>
```

```json
[
  {
    "name": "John",
    "age": "30",
    "country": "USA",
    "country#code": "US"
  }
]
```

## `transform: (row) => Record<string, any>`

A function that takes a row and returns a transformed row. This is useful for adjusting the data before it is loaded
into Flatfile.

#### Example with transform

```xml
<?xml version="1.0" encoding="utf-8" ?>
<root>
    <person>
        <name>John</name>
        <age>30</age>
        <country code="US">USA</country>
    </person>
    <person>
        <name>Jane</name>
        <age>25</age>
        <country code="CA">Canada</country>

    </person>
</root>
```

```js
import { XMLExtractor } from '@flatfile/plugin-extractor-xml'

export default (listener) => {
  listener.use(
    XMLExtractor({
      transform: (row) => {
        return {
          ...row,
          age: parseInt(row.age),
        }
      },
    })
  )
}
```

```json
[
  {
    "name": "John",
    "age": 30,
    "country": "USA",
    "country#code": "US"
  },
  {
    "name": "Jane",
    "age": 25,
    "country": "Canada",
    "country#code": "CA"
  }
]
```
