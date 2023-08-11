import { findRoot, headersFromObjectList, xmlToJson } from './parser'

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

  test('headersFromObjectList', function () {
    const json = xmlToJson(XML)
    expect(headersFromObjectList(json)).toEqual([
      'street',
      'country/name',
      'country/iso',
      'zip',
      'zip#format',
      '#active',
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
