<!-- START_INFOCARD -->

The `@flatfile/xml-extractor` plugin is designed to extract structured data from
XML files. It utilizes various libraries to parse XML files and retrieve the
structured data efficiently.

**Event Type:**
`listener.on('file:created')`

**Supported file types:**
`.xml`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

#### `separator` - `string` - `default="/" ` - (optional)
The separator to use when joining or flattening nested attributes.


#### `options.chunkSize` - `default="10_000"` - `number` - (optional)
The `chunkSize` parameter allows you to specify the quantity of records to in
each chunk.


#### `options.parallel` - `default="1"` - `number` - (optional)
The `parallel` parameter allows you to specify the number of chunks to process
in parallel.


**Before:**  

```xml before
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

**After:**  

```json after
[
  {
    "name": "John",
    "age": "30",
    "country/name": "USA",
    "country/code": "US"
  }
]
```


#### `attributePrefix` - `string` - `default: "#"` - (optional)
The prefix to use when flattening attributes of XML tags.  

**Before:** 

```xml before
<?xml version="1.0" encoding="utf-8" ?>
<root>
    <person>
        <name>John</name>
        <age>30</age>
        <country code="US">USA</country>
    </person>
</root>
```

**After:**  

```json after
[
  {
    "name": "John",
    "age": "30",
    "country": "USA",
    "country#code": "US"
  }
]
```


#### `transform` - `(row) => Record<string, any>` - (optional)
A function that takes a row and returns a transformed row. This is useful for
adjusting the data before it is loaded into Flatfile.


**Before:** 

```xml before
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

**listener.js** 

```js listener.js
import { XMLExtractor } from "@flatfile/plugin-xml-extractor";

export default (listener) => {
  listener.use(
    XMLExtractor({
      transform: (row) => {
        return {
          ...row,
          age: parseInt(row.age),
        };
      },
    })
  );
};
```

**After:**  

```json after
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


## Usage

Listen for an XML file to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```bash install
npm i @flatfile/plugin-xml-extractor
```

```js import
import { XMLExtractor } from "@flatfile/plugin-xml-extractor";
```

**listener.js** 

```js listener.js
listener.use(XMLExtractor());
```


### Additional Options

The extractor can accept additional properties. Props will be passed along to the Sheet.js parsing engine.

```js
listener.use(
  XMLExtractor({
    separator: "/",
    attributePrefix: "#",
    transform: (row: Record<string, any>) => {},
  })
);
```