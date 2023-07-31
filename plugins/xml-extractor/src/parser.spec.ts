import { findRoot, schemaFromObjectList, xmlToJson } from './parser'

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <addresses>
    <address active="true">
      <street>Ano nuevo</street>
      <country>
        <name>Spain</name>
        <iso>ES</iso>
      </country>
      <zip format="5">12345</zip>
    </address>
    <address active="false">
      <street>Foo</street>
      <country>
        <name>Spain</name>
        <iso>ES</iso>
      </country>
      <zip format="5">12345</zip>
    </address>
  </addresses>
</root>
`

const XMLWithOneItem = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <addresses>
    <address active="true">
      <street>Ano nuevo</street>
      <country>
        <name>Spain</name>
        <iso>ES</iso>
      </country>
      <zip format="5">12345</zip>
    </address>
  </addresses>
</root>
`

describe('parser', function () {
  describe('xmlToJson', function () {
    test('with multiple items', () => {
      expect(xmlToJson(XML)).toEqual([
        {
          street: 'Ano nuevo',
          'country/name': 'Spain',
          'country/iso': 'ES',
          zip: '12345',
          'zip#format': '5',
          '#active': 'true',
        },
        {
          street: 'Foo',
          'country/name': 'Spain',
          'country/iso': 'ES',
          zip: '12345',
          'zip#format': '5',
          '#active': 'false',
        },
      ])
    })

    test('with one item', () => {
      expect(xmlToJson(XMLWithOneItem)).toEqual([
        {
          street: 'Ano nuevo',
          'country/name': 'Spain',
          'country/iso': 'ES',
          zip: '12345',
          'zip#format': '5',
          '#active': 'true',
        },
      ])
    })
  })

  test('schemaFromObjectList', function () {
    const json = xmlToJson(XML)
    expect(schemaFromObjectList(json)).toEqual([
      {
        key: 'street',
        type: 'string',
      },
      {
        key: 'country/name',
        type: 'string',
      },
      {
        key: 'country/iso',
        type: 'string',
      },
      {
        key: 'zip',
        type: 'string',
      },
      {
        key: 'zip#format',
        type: 'string',
      },
      {
        key: '#active',
        type: 'string',
      },
    ])
  })

  describe('findRoot', function () {
    test('skips _declaration', () => {
      expect(
        findRoot({ _declaration: { foo: 'bar' }, red: { blue: 'green' } })
      ).toEqual([{ blue: 'green' }])
    })
    test('works with no declaration', () => {
      expect(findRoot({ red: { blue: 'green' } })).toEqual([{ blue: 'green' }])
    })
  })
})
