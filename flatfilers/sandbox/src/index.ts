import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { type Flatfile, FlatfileClient } from '@flatfile/api'
import '@flatfile/http-logger/init'
import { bulkRecordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { reconfigureSpace } from '../../../plugins/space-reconfigure/src'
import { contacts } from './sheets/contacts'

const api = new FlatfileClient()

const sheets = [
  {
    name: 'Bulk Upload - Material',
    slug: 'bulk-upload-material',
    fields: [
      {
        key: 'name',
        type: 'string',
        label: 'Material Name',
        description: 'Name of material or material blend.',
        constraints: [
          {
            type: 'required',
          },
        ],
      },
      {
        key: 'code',
        type: 'string',
        label: 'Material Code',
        description: 'User entered ID.',
      },
      {
        key: 'supplier',
        type: 'string',
        label: 'Material Supplier',
      },
      {
        key: 'country',
        type: 'enum',
        label: 'Material Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'baseMaterial1',
        label: 'Base Material 1',
        isArray: true,
        description:
          'Enter a default PIC material or MSI custom material by *Material Name*, or *Material ID*.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 'TX0014',
              label: 'Viscose/Rayon fabric',
            },
            {
              value: 'TX0024',
              label: 'Polyethylene (PE) Fabric',
            },
            {
              value: 'TX0016',
              label: 'Lyocell fabric',
            },
            {
              value: 'TX0018',
              label: 'Alpaca Fabric',
            },
            {
              value: 'TX0003',
              label: 'Polypropylene (PP) fabric',
            },
            {
              value: 'TX0013',
              label: 'Silk fabric',
            },
            {
              value: 'TX0025',
              label: 'Novel Polysaccharide fabric',
            },
            {
              value: 'TX0021',
              label: 'Hemp fiber fabric',
            },
            {
              value: 'TX0017',
              label: 'Acetate, Triacetate fabric',
            },
            {
              value: 'TX0009',
              label: 'Carbon fiber fabric',
            },
            {
              value: 'TX0020',
              label: 'Polyurethane (PU) fabric',
            },
            {
              value: 'TX0010',
              label: 'Cotton fabric',
            },
            {
              value: 'TX0008',
              label: 'Glass fiber fabric',
            },
            {
              value: 'TX0006',
              label: 'Aramid fabric',
            },
            {
              value: 'TX0022',
              label: 'Jute fiber fabric',
            },
            {
              value: 'TX0007',
              label: 'Elastane/Spandex  fabric',
            },
            {
              value: 'TX0012',
              label: 'Wool fabric',
            },
            {
              value: 'TX0004',
              label: 'Polylactic Acid (PLA) fabric',
            },
            {
              value: 'TX0023',
              label: 'Polytrimethylene terephthalate (PTT) fabric',
            },
            {
              value: 'TX0011',
              label: 'Flax fiber fabric',
            },
            {
              value: 'TX0015',
              label: 'Modal fabric',
            },
            {
              value: 'TX0002',
              label: 'Nylon fabric',
            },
            {
              value: 'TX0005',
              label: 'Acrylic fabric',
            },
            {
              value: 'TX0001',
              label: 'Polyester fabric',
            },
          ],
        },
      },
      {
        key: 'composition1',
        type: 'string',
        description:
          'Enter a number between 1-100 when the *Material* field is populated. All composition columns must add up to 100%.',
        label: 'Composition 1',
      },
      {
        type: 'enum',
        key: 'baseMaterial2',
        label: 'Base Material 2',
        isArray: true,
        description:
          'Enter a default PIC material or MSI custom material by *Material Name*, or *Material ID*.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 'TX0014',
              label: 'Viscose/Rayon fabric',
            },
            {
              value: 'TX0024',
              label: 'Polyethylene (PE) Fabric',
            },
            {
              value: 'TX0016',
              label: 'Lyocell fabric',
            },
            {
              value: 'TX0018',
              label: 'Alpaca Fabric',
            },
            {
              value: 'TX0003',
              label: 'Polypropylene (PP) fabric',
            },
            {
              value: 'TX0013',
              label: 'Silk fabric',
            },
            {
              value: 'TX0025',
              label: 'Novel Polysaccharide fabric',
            },
            {
              value: 'TX0021',
              label: 'Hemp fiber fabric',
            },
            {
              value: 'TX0017',
              label: 'Acetate, Triacetate fabric',
            },
            {
              value: 'TX0009',
              label: 'Carbon fiber fabric',
            },
            {
              value: 'TX0020',
              label: 'Polyurethane (PU) fabric',
            },
            {
              value: 'TX0010',
              label: 'Cotton fabric',
            },
            {
              value: 'TX0008',
              label: 'Glass fiber fabric',
            },
            {
              value: 'TX0006',
              label: 'Aramid fabric',
            },
            {
              value: 'TX0022',
              label: 'Jute fiber fabric',
            },
            {
              value: 'TX0007',
              label: 'Elastane/Spandex  fabric',
            },
            {
              value: 'TX0012',
              label: 'Wool fabric',
            },
            {
              value: 'TX0004',
              label: 'Polylactic Acid (PLA) fabric',
            },
            {
              value: 'TX0023',
              label: 'Polytrimethylene terephthalate (PTT) fabric',
            },
            {
              value: 'TX0011',
              label: 'Flax fiber fabric',
            },
            {
              value: 'TX0015',
              label: 'Modal fabric',
            },
            {
              value: 'TX0002',
              label: 'Nylon fabric',
            },
            {
              value: 'TX0005',
              label: 'Acrylic fabric',
            },
            {
              value: 'TX0001',
              label: 'Polyester fabric',
            },
          ],
        },
      },
      {
        key: 'composition2',
        type: 'string',
        description:
          'Enter a number between 1-100 when the *Material* field is populated. All composition columns must add up to 100%.',
        label: 'Composition 2',
      },
      {
        type: 'enum',
        key: 'baseMaterial3',
        label: 'Base Material 3',
        isArray: true,
        description:
          'Enter a default PIC material or MSI custom material by *Material Name*, or *Material ID*.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 'TX0014',
              label: 'Viscose/Rayon fabric',
            },
            {
              value: 'TX0024',
              label: 'Polyethylene (PE) Fabric',
            },
            {
              value: 'TX0016',
              label: 'Lyocell fabric',
            },
            {
              value: 'TX0018',
              label: 'Alpaca Fabric',
            },
            {
              value: 'TX0003',
              label: 'Polypropylene (PP) fabric',
            },
            {
              value: 'TX0013',
              label: 'Silk fabric',
            },
            {
              value: 'TX0025',
              label: 'Novel Polysaccharide fabric',
            },
            {
              value: 'TX0021',
              label: 'Hemp fiber fabric',
            },
            {
              value: 'TX0017',
              label: 'Acetate, Triacetate fabric',
            },
            {
              value: 'TX0009',
              label: 'Carbon fiber fabric',
            },
            {
              value: 'TX0020',
              label: 'Polyurethane (PU) fabric',
            },
            {
              value: 'TX0010',
              label: 'Cotton fabric',
            },
            {
              value: 'TX0008',
              label: 'Glass fiber fabric',
            },
            {
              value: 'TX0006',
              label: 'Aramid fabric',
            },
            {
              value: 'TX0022',
              label: 'Jute fiber fabric',
            },
            {
              value: 'TX0007',
              label: 'Elastane/Spandex  fabric',
            },
            {
              value: 'TX0012',
              label: 'Wool fabric',
            },
            {
              value: 'TX0004',
              label: 'Polylactic Acid (PLA) fabric',
            },
            {
              value: 'TX0023',
              label: 'Polytrimethylene terephthalate (PTT) fabric',
            },
            {
              value: 'TX0011',
              label: 'Flax fiber fabric',
            },
            {
              value: 'TX0015',
              label: 'Modal fabric',
            },
            {
              value: 'TX0002',
              label: 'Nylon fabric',
            },
            {
              value: 'TX0005',
              label: 'Acrylic fabric',
            },
            {
              value: 'TX0001',
              label: 'Polyester fabric',
            },
          ],
        },
      },
      {
        key: 'composition3',
        type: 'string',
        description:
          'Enter a number between 1-100 when the *Material* field is populated. All composition columns must add up to 100%.',
        label: 'Composition 3',
      },
      {
        type: 'enum',
        key: 'baseMaterial4',
        label: 'Base Material 4',
        isArray: true,
        description:
          'Enter a default PIC material or MSI custom material by *Material Name*, or *Material ID*.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 'TX0014',
              label: 'Viscose/Rayon fabric',
            },
            {
              value: 'TX0024',
              label: 'Polyethylene (PE) Fabric',
            },
            {
              value: 'TX0016',
              label: 'Lyocell fabric',
            },
            {
              value: 'TX0018',
              label: 'Alpaca Fabric',
            },
            {
              value: 'TX0003',
              label: 'Polypropylene (PP) fabric',
            },
            {
              value: 'TX0013',
              label: 'Silk fabric',
            },
            {
              value: 'TX0025',
              label: 'Novel Polysaccharide fabric',
            },
            {
              value: 'TX0021',
              label: 'Hemp fiber fabric',
            },
            {
              value: 'TX0017',
              label: 'Acetate, Triacetate fabric',
            },
            {
              value: 'TX0009',
              label: 'Carbon fiber fabric',
            },
            {
              value: 'TX0020',
              label: 'Polyurethane (PU) fabric',
            },
            {
              value: 'TX0010',
              label: 'Cotton fabric',
            },
            {
              value: 'TX0008',
              label: 'Glass fiber fabric',
            },
            {
              value: 'TX0006',
              label: 'Aramid fabric',
            },
            {
              value: 'TX0022',
              label: 'Jute fiber fabric',
            },
            {
              value: 'TX0007',
              label: 'Elastane/Spandex  fabric',
            },
            {
              value: 'TX0012',
              label: 'Wool fabric',
            },
            {
              value: 'TX0004',
              label: 'Polylactic Acid (PLA) fabric',
            },
            {
              value: 'TX0023',
              label: 'Polytrimethylene terephthalate (PTT) fabric',
            },
            {
              value: 'TX0011',
              label: 'Flax fiber fabric',
            },
            {
              value: 'TX0015',
              label: 'Modal fabric',
            },
            {
              value: 'TX0002',
              label: 'Nylon fabric',
            },
            {
              value: 'TX0005',
              label: 'Acrylic fabric',
            },
            {
              value: 'TX0001',
              label: 'Polyester fabric',
            },
          ],
        },
      },
      {
        key: 'composition4',
        type: 'string',
        description:
          'Enter a number between 1-100 when the *Material* field is populated. All composition columns must add up to 100%.',
        label: 'Composition 4',
      },
      {
        type: 'enum',
        key: 'T2Facility',
        label: 'T2 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'T2Country',
        type: 'enum',
        label: 'T2 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'T3Facility',
        label: 'T3 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'T3Country',
        type: 'enum',
        label: 'T3 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'P002Facility',
        label: 'P002 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'P002Country',
        type: 'enum',
        label: 'P002 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'P003Facility',
        label: 'P003 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'P003Country',
        type: 'enum',
        label: 'P003 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'P004Facility',
        label: 'P004 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'P004Country',
        type: 'enum',
        label: 'P004 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'P005Facility',
        label: 'P005 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'P005Country',
        type: 'enum',
        label: 'P005 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        type: 'enum',
        key: 'P006Facility',
        label: 'P006 Facility',
        isArray: true,
        description: 'Supplier Name or Worldly Id.',
        multi: true,
        config: {
          allowCustom: true,
          options: [
            {
              value: 144804,
              label: 'finalProductAssembly - 5Y7LDWV',
            },
            {
              value: 145007,
              label: 'finalProductAssembly - VAJ2KYY',
            },
            {
              value: 145376,
              label: 'finalProductAssembly - DWXFDE6',
            },
            {
              value: 145284,
              label:
                'printingProductDyeingAndLaundering,finalProductAssembly - SJWG9ZY',
            },
            {
              value: 144929,
              label: 'Manufacturer A -MatProd - 2B68ZRK',
            },
            {
              value: 145029,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 770JH4F',
            },
            {
              value: 145356,
              label: 'printingProductDyeingAndLaundering - C55SWLM',
            },
            {
              value: 145311,
              label: 'finalProductAssembly - BYPS0Z8',
            },
            {
              value: 145235,
              label: 'finalProductAssembly - NHUTTKD',
            },
            {
              value: 145191,
              label: 'finalProductAssembly - JN8VC5Z',
            },
            {
              value: 145317,
              label: 'finalProductAssembly - AXNDTJ6',
            },
            {
              value: 144924,
              label: 'finalProductAssembly - 2BG9BRY',
            },
            {
              value: 144915,
              label: 'materialProduction - WeaveDyePrintPrep-MatProd-JZWHPSG',
            },
            {
              value: 145141,
              label: 'finalProductAssembly - 3PM69QW',
            },
            {
              value: 145351,
              label: 'finalProductAssembly - 5DNPCX4',
            },
            {
              value: 145312,
              label: 'printingProductDyeingAndLaundering - V7UB0GA',
            },
            {
              value: 145096,
              label: 'materialProduction - 410GXPD',
            },
            {
              value: 144791,
              label: 'finalProductAssembly - C0S84LT',
            },
            {
              value: 144813,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - TVBBH36',
            },
            {
              value: 145182,
              label: 'printingProductDyeingAndLaundering - ZNNGCLA',
            },
            {
              value: 145290,
              label: 'printingProductDyeingAndLaundering - V3BW0CS',
            },
            {
              value: 145370,
              label: 'M1FMRD4',
            },
            {
              value: 144839,
              label: 'finalProductAssembly - E4NFEFT',
            },
            {
              value: 144845,
              label: 'finalProductAssembly - NEMEWDC',
            },
            {
              value: 145042,
              label: 'printingProductDyeingAndLaundering - ZMUTT9X',
            },
            {
              value: 145363,
              label: 'finalProductAssembly - L2Z9UG8',
            },
            {
              value: 145022,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 75XTA47',
            },
            {
              value: 144846,
              label: 'materialProduction - G8VZU2K',
            },
            {
              value: 145294,
              label: 'finalProductAssembly - DLLS2LL',
            },
            {
              value: 144827,
              label: 'finalProductAssembly - TUTJK45',
            },
            {
              value: 145217,
              label: 'printingProductDyeingAndLaundering - PME8R1Q',
            },
            {
              value: 144857,
              label: 'finalProductAssembly - DV85ML2',
            },
            {
              value: 145272,
              label: 'finalProductAssembly - 4V60XVS',
            },
            {
              value: 145135,
              label:
                'materialProduction - Knit - Dye - Heat - MatProd - 6K2LZ3F',
            },
            {
              value: 144761,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - V2EAG05',
            },
            {
              value: 145164,
              label: 'materialProduction - KnitDyeHeatFinish-MatProd-EVBUQZZ',
            },
            {
              value: 144977,
              label: 'K2SKARN',
            },
            {
              value: 145205,
              label: 'finalProductAssembly - 9WUGDMQ',
            },
            {
              value: 145080,
              label: 'materialProduction - Z0N7973',
            },
            {
              value: 145310,
              label: 'finalProductAssembly - WPS8MGW',
            },
            {
              value: 144974,
              label: 'finalProductAssembly - R2W2VVX',
            },
            {
              value: 145063,
              label: 'finalProductAssembly - 2TUUNC9',
            },
            {
              value: 144941,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 5UNGXWB',
            },
            {
              value: 144861,
              label: 'Manufacturer D - materialProd - 2M85KQ3',
            },
            {
              value: 144819,
              label: 'materialProduction - HW6NBTX',
            },
            {
              value: 144841,
              label: 'finalProductAssembly - 7Q7MHTC',
            },
            {
              value: 144942,
              label: 'finalProductAssembly - ZT6K6QC',
            },
            {
              value: 145038,
              label: 'finalProductAssembly - WFCVFYW',
            },
            {
              value: 144829,
              label: 'finalProductAssembly - 8DLM4KP',
            },
            {
              value: 145116,
              label: 'printingProductDyeingAndLaundering - TN4M5UC',
            },
            {
              value: 145130,
              label: 'finalProductAssembly - VUAW1N7',
            },
            {
              value: 145341,
              label: 'Manufacturer C - matProd - 32L1J52',
            },
            {
              value: 145281,
              label: 'finalProductAssembly - SDEK6TD',
            },
            {
              value: 144801,
              label: 'finalProductAssembly - 01ATR4L',
            },
            {
              value: 144960,
              label:
                'printingProductDyeingAndLaundering,materialProduction - BVZ62DQ',
            },
            {
              value: 144975,
              label: 'finalProductAssembly - T82XQ9C',
            },
            {
              value: 144833,
              label: 'finalProductAssembly - 0PC02JL',
            },
            {
              value: 144920,
              label: 'finalProductAssembly - 85C1C6V',
            },
            {
              value: 145348,
              label: 'printingProductDyeingAndLaundering - 1DVBT1X',
            },
            {
              value: 144870,
              label: 'printingProductDyeingAndLaundering - VVU8GA9',
            },
            {
              value: 144957,
              label: 'materialProduction - WZWM47Z',
            },
            {
              value: 144881,
              label: 'finalProductAssembly - JJ7XU80',
            },
            {
              value: 144914,
              label: 'finalProductAssembly - YM78YXR',
            },
            {
              value: 144911,
              label: 'materialProduction - T4H8L4X',
            },
            {
              value: 144888,
              label:
                'materialProduction - WeaveDyePrintFinishBraid-MatProd-LM8F9N8',
            },
            {
              value: 144908,
              label: 'finalProductAssembly,materialProduction - 3UNJUVW',
            },
            {
              value: 144933,
              label: 'finalProductAssembly - R498W4C',
            },
            {
              value: 144777,
              label: 'materialProduction - KnitDyeHeatWash-MatProd-F509MLE',
            },
            {
              value: 145225,
              label: 'printingProductDyeingAndLaundering - BUF988A',
            },
            {
              value: 145192,
              label: 'EHN0DPA',
            },
            {
              value: 145194,
              label: 'materialProduction - 62CQXE1',
            },
            {
              value: 144964,
              label: 'finalProductAssembly - KR5U81U',
            },
            {
              value: 144923,
              label: 'materialProduction - CD10DRG',
            },
            {
              value: 145286,
              label: 'finalProductAssembly - DMCYGE8',
            },
            {
              value: 145137,
              label: 'finalProductAssembly - 7AH0QFH',
            },
            {
              value: 144891,
              label: 'finalProductAssembly - WC7G1RQ',
            },
            {
              value: 144760,
              label: 'finalProductAssembly - MB1F3VC',
            },
            {
              value: 145131,
              label: 'materialProduction - Material Production - 5DMVUC6',
            },
            {
              value: 144970,
              label: 'materialProduction - D027KYS',
            },
            {
              value: 144894,
              label: 'finalProductAssembly - FWV4V1U',
            },
            {
              value: 144805,
              label: 'materialProduction - H11U9D9',
            },
            {
              value: 145250,
              label: 'printingProductDyeingAndLaundering - KXSTTLZ',
            },
            {
              value: 145150,
              label: 'printingProductDyeingAndLaundering - N5Q50XJ',
            },
            {
              value: 145362,
              label: 'finalProductAssembly - YVS076B',
            },
            {
              value: 145187,
              label: 'printingProductDyeingAndLaundering - QETESAP',
            },
            {
              value: 144996,
              label: 'printingProductDyeingAndLaundering - P9H4L4K',
            },
            {
              value: 145224,
              label: 'printingProductDyeingAndLaundering - 83RLPC1',
            },
            {
              value: 145342,
              label: 'finalProductAssembly - WNBV6SX',
            },
            {
              value: 144851,
              label: 'finalProductAssembly - RYJ139P',
            },
            {
              value: 144935,
              label: 'FA07CWR',
            },
            {
              value: 145159,
              label: 'finalProductAssembly - 6SL66VE',
            },
            {
              value: 145316,
              label: 'rawMaterialProcessing - YarnSpin-RawMat-HKVF3G4',
            },
            {
              value: 144873,
              label: 'printingProductDyeingAndLaundering - HVKKFH0',
            },
            {
              value: 145265,
              label: 'finalProductAssembly - BD49QAA',
            },
            {
              value: 145010,
              label: 'finalProductAssembly - RQULHDP',
            },
            {
              value: 144783,
              label: 'printingProductDyeingAndLaundering - 6V21L71',
            },
            {
              value: 144912,
              label: 'materialProduction - QSAJ9BE',
            },
            {
              value: 145065,
              label: 'materialProduction - QYRV2R9',
            },
            {
              value: 145073,
              label: 'materialProduction - N1Q4H6L',
            },
            {
              value: 145318,
              label: 'rawMaterialProcessing - U7V2CX8',
            },
            {
              value: 144882,
              label: 'materialProduction - XPL5X8Z',
            },
            {
              value: 144858,
              label: 'finalProductAssembly - V6ZNE7R',
            },
            {
              value: 145367,
              label: 'EFYD8F5',
            },
            {
              value: 144814,
              label: 'WYPC3DP',
            },
            {
              value: 145016,
              label: 'finalProductAssembly - 19UVSEW',
            },
            {
              value: 145291,
              label: 'printingProductDyeingAndLaundering - 8N8PFKD',
            },
            {
              value: 145003,
              label: 'finalProductAssembly - C61YA7T',
            },
            {
              value: 144925,
              label: 'finalProductAssembly - 6R24S3Q',
            },
            {
              value: 144854,
              label: 'finalProductAssembly - XJD43JL',
            },
            {
              value: 144897,
              label: 'hardComponentTrimProduction - VRU60VZ',
            },
            {
              value: 144999,
              label: 'materialProduction - 6FCU6YL',
            },
            {
              value: 144934,
              label: 'JE0XSH4',
            },
            {
              value: 144883,
              label: 'finalProductAssembly - W1L84MJ',
            },
            {
              value: 144788,
              label: 'finalProductAssembly,materialProduction - XWQSWSF',
            },
            {
              value: 145359,
              label: 'finalProductAssembly - H7GQVQG',
            },
            {
              value: 145334,
              label: 'materialProduction - C66UWUU',
            },
            {
              value: 145349,
              label: 'finalProductAssembly - 76B0AB8',
            },
            {
              value: 145188,
              label: 'printingProductDyeingAndLaundering - 98MEDXY',
            },
            {
              value: 145128,
              label: 'finalProductAssembly - EEFKCQD',
            },
            {
              value: 145193,
              label: 'printingProductDyeingAndLaundering - PQM4PS3',
            },
            {
              value: 145315,
              label: 'materialProduction - 6RQZ31D',
            },
            {
              value: 145332,
              label: 'printingProductDyeingAndLaundering - R33JTXS',
            },
            {
              value: 145071,
              label: 'finalProductAssembly - W5GVWA1',
            },
            {
              value: 144955,
              label: 'printingProductDyeingAndLaundering - GN8SGRN',
            },
            {
              value: 145283,
              label: 'finalProductAssembly - 4HD8TRU',
            },
            {
              value: 145043,
              label: 'finalProductAssembly - ZPJQSAU',
            },
            {
              value: 145035,
              label: '1Y5KPCY',
            },
            {
              value: 144815,
              label: 'P1EC68E',
            },
            {
              value: 145274,
              label: 'Premier Textiles Ltd. 756J1KK ',
            },
            {
              value: 144943,
              label: 'ERG1RY2',
            },
            {
              value: 145100,
              label: 'QMLBTL7',
            },
            {
              value: 145087,
              label: '22HJ2RA',
            },
            {
              value: 144820,
              label: 'CKQZ0W8',
            },
            {
              value: 145314,
              label: 'ZSFHKBH',
            },
            {
              value: 145105,
              label: 'GWFFG6N',
            },
            {
              value: 144928,
              label: 'Dye-MatProd-V8BEE5B',
            },
            {
              value: 144940,
              label: '3NJRMR1',
            },
            {
              value: 145263,
              label: '2H0PDBX',
            },
            {
              value: 145303,
              label: 'UGCM533',
            },
            {
              value: 144834,
              label: 'finalProductAssembly - 0PR1KP9',
            },
            {
              value: 145313,
              label: 'Weave - Raw Mat - RG5FX9A',
            },
            {
              value: 145138,
              label: 'GSGJ36Y',
            },
            {
              value: 144798,
              label: 'finalProductAssembly - 942CTTK',
            },
            {
              value: 145177,
              label: '23MPPQY',
            },
            {
              value: 145207,
              label: '13UHYNY',
            },
            {
              value: 145121,
              label: 'U3KYJQL',
            },
            {
              value: 145033,
              label: 'UM69VDB',
            },
            {
              value: 144953,
              label: '2ALHWNQ',
            },
            {
              value: 144808,
              label: 'finalProductAssembly - 22027B1',
            },
            {
              value: 145006,
              label: 'QJ2042M',
            },
            {
              value: 145098,
              label: 'X113M25',
            },
            {
              value: 145278,
              label: 'Q0A05AE',
            },
            {
              value: 145203,
              label: 'QMFW0HA',
            },
            {
              value: 144910,
              label: 'VP4AK1P',
            },
            {
              value: 144913,
              label: 'VWK7LSP',
            },
            {
              value: 145002,
              label: 'finalProductAssembly - R8HVNFG',
            },
            {
              value: 144984,
              label: '0AE9N28',
            },
            {
              value: 144954,
              label: 'finalProductAssembly - 2JNR68L',
            },
            {
              value: 145343,
              label: '4UM078E',
            },
            {
              value: 145296,
              label: 'RGVUJGY',
            },
            {
              value: 145104,
              label:
                'materialProduction - Weave - MatProd - Spandex Only - BQCP3T5',
            },
            {
              value: 145379,
              label: 'finalProductAssembly - T6FAMUA',
            },
            {
              value: 144895,
              label: '41M2CAR',
            },
            {
              value: 144877,
              label: '8GPW4K0',
            },
            {
              value: 144991,
              label: 'QXCL09H',
            },
            {
              value: 145179,
              label: 'E3NVZ2Y',
            },
            {
              value: 145216,
              label: '3RTZDTD',
            },
            {
              value: 144909,
              label: 'Knit - Mat Prod - 2HYDVEQ',
            },
            {
              value: 145258,
              label: '8VF5KUC',
            },
            {
              value: 145186,
              label: 'V5E6JWX',
            },
            {
              value: 145119,
              label: '64C83JL',
            },
            {
              value: 145350,
              label: 'PHBMPUD',
            },
            {
              value: 145384,
              label: 'QPLT1LX',
            },
            {
              value: 145352,
              label: '5VUK5ZU',
            },
            {
              value: 145355,
              label: 'NNYGAUX',
            },
            {
              value: 145028,
              label: '6CRSWXC',
            },
            {
              value: 145155,
              label: '94S78QM',
            },
            {
              value: 145220,
              label: 'finalProductAssembly - VQB7MWC',
            },
            {
              value: 145021,
              label: 'finalProductAssembly - ZRRBAP8',
            },
            {
              value: 145127,
              label: 'XXBWLAT',
            },
            {
              value: 144875,
              label: 'HBQ9WAW',
            },
            {
              value: 144907,
              label: 'materialProduction - FY3B0TQ',
            },
            {
              value: 145288,
              label: 'materialProduction - P5AQXQN',
            },
            {
              value: 144840,
              label: 'finalProductAssembly - N3BGQWU',
            },
            {
              value: 145139,
              label: 'finalProductAssembly - 39GQY1S',
            },
            {
              value: 145271,
              label: 'Q8WLYH4',
            },
            {
              value: 145180,
              label: 'finalProductAssembly - VUE2RNE',
            },
            {
              value: 145115,
              label: 'printingProductDyeingAndLaundering - KK51WRR',
            },
            {
              value: 145347,
              label: 'LBN1YFW',
            },
            {
              value: 145268,
              label: 'RPGET2L',
            },
            {
              value: 145066,
              label: '990DWAX',
            },
            {
              value: 145013,
              label: 'ZEUTKM4',
            },
            {
              value: 144879,
              label: '1NK7E4B',
            },
            {
              value: 145221,
              label: 'YHW9XVH',
            },
            {
              value: 145340,
              label: 'NUSAGCS',
            },
            {
              value: 145389,
              label: 'X9UK2AG',
            },
            {
              value: 145277,
              label: 'JXD25SF',
            },
            {
              value: 145132,
              label: 'PMC7R16',
            },
            {
              value: 144853,
              label: 'materialProduction - PEX1JNK',
            },
            {
              value: 145230,
              label: '6Y6845K',
            },
            {
              value: 144826,
              label: 'finalProductAssembly - G86WHP1',
            },
            {
              value: 145057,
              label: '9542EGS',
            },
            {
              value: 144766,
              label: 'V1JMXQ1',
            },
            {
              value: 145008,
              label: 'LVES57S',
            },
            {
              value: 145385,
              label: 'finalProductAssembly - KMG55QT',
            },
            {
              value: 145337,
              label: 'DCHTT8S',
            },
            {
              value: 144993,
              label: '9A83YNG',
            },
            {
              value: 145206,
              label: 'X64WG97',
            },
            {
              value: 144868,
              label: 'ZZD2RJR',
            },
            {
              value: 145330,
              label: 'KRHKPY3',
            },
            {
              value: 144926,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - 4G0ZXRE',
            },
            {
              value: 144937,
              label: 'JMV16VZ',
            },
            {
              value: 144900,
              label: 'finalProductAssembly - X8JU0LS',
            },
            {
              value: 145319,
              label: 'R6YSTA6',
            },
            {
              value: 145201,
              label: 'S6GGGB1',
            },
            {
              value: 144778,
              label: 'XP2NHG8',
            },
            {
              value: 145333,
              label: 'UWTWG5L',
            },
            {
              value: 145084,
              label: 'HMKL561',
            },
            {
              value: 144793,
              label: '2TFAQR9',
            },
            {
              value: 145226,
              label: 'rawMat-Braiding-K725RKJ',
            },
            {
              value: 144863,
              label: '91K55HF',
            },
            {
              value: 145261,
              label: 'R74MNK4',
            },
            {
              value: 145075,
              label: 'M6F8HMV',
            },
            {
              value: 145133,
              label: '4MSLA8B',
            },
            {
              value: 144890,
              label: 'D3AT4MW',
            },
            {
              value: 145195,
              label:
                'finalProductAssembly,hardComponentTrimProduction - 78Q49A2',
            },
            {
              value: 145190,
              label: '2H86LR9',
            },
            {
              value: 145126,
              label: 'L8BFK7Y',
            },
            {
              value: 145387,
              label: 'materialProduction - ZBSZ7G8',
            },
            {
              value: 145336,
              label: '3Y1NQ30',
            },
            {
              value: 144918,
              label: 'ZBWBYXK',
            },
            {
              value: 145251,
              label: 'A4V7P36',
            },
            {
              value: 144862,
              label: 'VNSNDMP',
            },
            {
              value: 145125,
              label: 'KZXP0DB',
            },
            {
              value: 144994,
              label: '5FWYEW8',
            },
            {
              value: 145306,
              label: 'printingProductDyeingAndLaundering - VNQ0ZPH',
            },
            {
              value: 144784,
              label: 'RGRUHH4',
            },
            {
              value: 144927,
              label:
                'printingProductDyeingAndLaundering,materialProduction - 4KK0MZD',
            },
            {
              value: 144816,
              label: 'FPZ07E7',
            },
            {
              value: 144939,
              label: '5UT5800',
            },
            {
              value: 144978,
              label: 'KY67ARB',
            },
            {
              value: 144904,
              label: 'materialProduction - 44A7V6V',
            },
            {
              value: 145295,
              label: 'JEBT31H',
            },
            {
              value: 145321,
              label: 'materialProduction - RAU2BMD',
            },
            {
              value: 144797,
              label: 'Y5UNR3R',
            },
            {
              value: 145176,
              label: 'M3H275D',
            },
            {
              value: 145339,
              label: 'VEA64UY',
            },
            {
              value: 144958,
              label: 'C7KYSMM',
            },
            {
              value: 145247,
              label: '11K9FBJ',
            },
            {
              value: 144837,
              label: 'T4P5YQQ',
            },
            {
              value: 145237,
              label: 'finalProductAssembly,materialProduction - NVWDTQU',
            },
            {
              value: 145338,
              label: 'BGCJ0CD',
            },
            {
              value: 144838,
              label: 'VX630QX',
            },
            {
              value: 145335,
              label: 'DVH8TNK',
            },
            {
              value: 144997,
              label: '0KN5RKS',
            },
            {
              value: 144995,
              label: '34LXDUX',
            },
            {
              value: 145147,
              label: 'A91UTFH',
            },
            {
              value: 145344,
              label: '7N3WLZV',
            },
            {
              value: 145259,
              label: 'TYBKNWZ',
            },
            {
              value: 145324,
              label: '1Y6STY8',
            },
            {
              value: 145302,
              label: 'printingProductDyeingAndLaundering - SN1WP67',
            },
            {
              value: 145107,
              label: '34ZA7T8',
            },
            {
              value: 144982,
              label: 'Y5B5VVE',
            },
            {
              value: 144811,
              label: 'TZT29UX',
            },
            {
              value: 145374,
              label: '2RUMYF6',
            },
            {
              value: 145309,
              label: '8RNK1A8',
            },
            {
              value: 145181,
              label: 'N63284P',
            },
            {
              value: 145001,
              label: 'WVLXM2R',
            },
            {
              value: 145171,
              label: '7W2UF4X',
            },
            {
              value: 145279,
              label: 'Manufacturer B - matProd - 31F408D',
            },
            {
              value: 144899,
              label: 'EZJA69D',
            },
            {
              value: 145163,
              label: 'materialProduction - WeaveDyeHeatWash-MatProd-5KG610Y',
            },
            {
              value: 145293,
              label: '9BQHAB4',
            },
            {
              value: 144966,
              label: 'KnitDye-MatProd-BPWFQ9U',
            },
            {
              value: 144965,
              label: 'JHP3XAC',
            },
            {
              value: 145012,
              label: 'materialProduction - FVTAXRJ',
            },
            {
              value: 145158,
              label: 'finalProductAssembly - EN1DNRA',
            },
            {
              value: 145285,
              label: 'printingProductDyeingAndLaundering - CZG5AGG',
            },
            {
              value: 145018,
              label: 'printingProductDyeingAndLaundering - DKUEWK7',
            },
            {
              value: 145270,
              label: 'PGUYYRF',
            },
            {
              value: 145166,
              label: 'WN4SX2V',
            },
            {
              value: 145326,
              label: 'Weave - RawMat - MXXW11K',
            },
            {
              value: 144809,
              label: 'GJAP5AK',
            },
            {
              value: 144859,
              label: 'JQ7X0AJ',
            },
            {
              value: 144828,
              label: 'CBRQJF3',
            },
            {
              value: 144848,
              label: 'PMH7EVZ',
            },
            {
              value: 145199,
              label: '58H44L3',
            },
            {
              value: 145054,
              label: '3Y035DK',
            },
            {
              value: 145289,
              label: 'VNPPPLF',
            },
            {
              value: 144866,
              label: 'G1N40G3',
            },
            {
              value: 144781,
              label:
                'finalProductAssembly,printingProductDyeingAndLaundering - S8TWCBZ',
            },
            {
              value: 144986,
              label: 'A728JDB',
            },
            {
              value: 145245,
              label: 'Weave - MatProd - W0F60G2',
            },
            {
              value: 145292,
              label: 'YDEKL2X',
            },
            {
              value: 145074,
              label: 'materialProduction - SX0SAL1',
            },
            {
              value: 145328,
              label: 'Yarn Spinner - 309RZSQ',
            },
            {
              value: 144944,
              label: 'RTKNU8T',
            },
            {
              value: 144949,
              label: 'F8AWWLJ',
            },
            {
              value: 144930,
              label: '8DX8290',
            },
            {
              value: 144812,
              label: '69F6H31',
            },
            {
              value: 144773,
              label: 'UW0MRZK',
            },
            {
              value: 145287,
              label: 'HP0A9K4',
            },
            {
              value: 145055,
              label: 'QPG86GX',
            },
            {
              value: 145386,
              label: 'D3P42GU',
            },
            {
              value: 145044,
              label: '6AZVQ68',
            },
            {
              value: 145214,
              label: '7LNRVYY',
            },
            {
              value: 144903,
              label: 'EANPSZ0',
            },
            {
              value: 144916,
              label: 'CFWQCNH',
            },
            {
              value: 145160,
              label: 'S54NNA9',
            },
            {
              value: 144921,
              label: 'TAC8VCJ',
            },
            {
              value: 144869,
              label: 'LJB7TTJ',
            },
            {
              value: 145089,
              label: '8DJWP56',
            },
            {
              value: 145304,
              label: '6ZYEH0T',
            },
            {
              value: 144898,
              label: 'BXMA2JN',
            },
            {
              value: 145282,
              label: 'S1YKDYF',
            },
            {
              value: 145123,
              label: 'HE4PJVM',
            },
            {
              value: 145120,
              label: 'LYF884A',
            },
            {
              value: 144796,
              label: 'Q9N7BMD',
            },
            {
              value: 144931,
              label: 'E73RXZM',
            },
            {
              value: 145149,
              label: 'K0SY05C',
            },
            {
              value: 145070,
              label: 'U57CKDT',
            },
            {
              value: 145280,
              label: 'CQZBN31',
            },
            {
              value: 145299,
              label: '22DPBPP',
            },
            {
              value: 144842,
              label:
                'printingProductDyeingAndLaundering,materialProduction - NW0XSV2',
            },
            {
              value: 145175,
              label: 'LW0L2JX',
            },
            {
              value: 144856,
              label: 'finalProductAssembly - UHXCJRF',
            },
            {
              value: 145256,
              label: '64MF3TX',
            },
            {
              value: 144864,
              label: 'QUD66UC',
            },
            {
              value: 145242,
              label: '4P2WXWZ',
            },
            {
              value: 145077,
              label: '2VG8JNS',
            },
            {
              value: 145111,
              label: 'WBT279F',
            },
            {
              value: 144947,
              label: '1Y1UJB5',
            },
            {
              value: 145088,
              label: 'Weave-MatProd-0PS89UW',
            },
            {
              value: 145219,
              label: 'YQ0AV1G',
            },
            {
              value: 144956,
              label: 'U9GPNVH',
            },
            {
              value: 145373,
              label: '25V23BY',
            },
            {
              value: 145249,
              label: '0V4SQQQ',
            },
            {
              value: 145241,
              label: '814F7P0',
            },
            {
              value: 144831,
              label: 'NA4AAB4',
            },
            {
              value: 145154,
              label: 'DR24ZAV',
            },
            {
              value: 145079,
              label: 'U6CDCW9',
            },
            {
              value: 145108,
              label: 'MCA1HRM',
            },
            {
              value: 145146,
              label: 'QMG137X',
            },
            {
              value: 144792,
              label: 'ZVJBHNG',
            },
            {
              value: 145056,
              label: 'KLMA96L',
            },
            {
              value: 145114,
              label: 'LZ47WBN',
            },
            {
              value: 145148,
              label: 'SNCMDU0',
            },
            {
              value: 144844,
              label: 'materialProduction - F3DU8UX',
            },
            {
              value: 145262,
              label: '5N5A6GF',
            },
            {
              value: 145124,
              label: '9PKVWCQ',
            },
            {
              value: 145031,
              label: 'E4Z2A9L',
            },
            {
              value: 145266,
              label: 'CTG99HM',
            },
            {
              value: 144764,
              label: '8L91W81',
            },
            {
              value: 145254,
              label: '3B901XB',
            },
            {
              value: 144803,
              label: '9F7Q40Q',
            },
            {
              value: 145253,
              label: 'XN03514',
            },
            {
              value: 145298,
              label: 'C9J7TU6',
            },
            {
              value: 145228,
              label: '1DWR1FZ',
            },
            {
              value: 145183,
              label: 'VACMBM9',
            },
            {
              value: 144971,
              label: 'NEMZ6SJ',
            },
            {
              value: 145248,
              label: '96JQFTU',
            },
            {
              value: 145046,
              label: 'RWM3BVK',
            },
            {
              value: 145231,
              label: 'TA6KZLM',
            },
            {
              value: 145233,
              label: 'QL4Z4JH',
            },
            {
              value: 145076,
              label: '4M5DW3N',
            },
            {
              value: 145109,
              label: 'EAN2AR0',
            },
            {
              value: 144799,
              label: 'YC6L0LQ',
            },
            {
              value: 145244,
              label: 'YDU2VWC',
            },
            {
              value: 145210,
              label: 'ELSRL72',
            },
            {
              value: 144884,
              label: 'LUABMZK',
            },
            {
              value: 145052,
              label: 'Z38SP7M',
            },
            {
              value: 145211,
              label: 'DMW19YZ',
            },
            {
              value: 145185,
              label: '9U9GLMT',
            },
            {
              value: 145208,
              label: '4J6J8BR',
            },
            {
              value: 144860,
              label: 'R75XP11',
            },
            {
              value: 145229,
              label: 'RB8Y0R7',
            },
            {
              value: 145212,
              label: 'FH00KX0',
            },
            {
              value: 145204,
              label: 'HW6KQZC',
            },
            {
              value: 145140,
              label: '7JAFGQD',
            },
            {
              value: 145110,
              label: '2E9DUP4',
            },
            {
              value: 145117,
              label: 'WFLZXDK',
            },
            {
              value: 145030,
              label: '8N7J69G',
            },
            {
              value: 145156,
              label: 'VC89NLG',
            },
            {
              value: 145173,
              label: '2NP3027',
            },
            {
              value: 145161,
              label: 'LFE14M9',
            },
            {
              value: 145036,
              label: 'Q8NEAST',
            },
            {
              value: 144780,
              label: '28XUQJ9',
            },
            {
              value: 145011,
              label: 'GCXFX06',
            },
            {
              value: 145027,
              label: '6EH8JUG',
            },
            {
              value: 144779,
              label: '5AZWHHV',
            },
            {
              value: 144981,
              label: 'CL5A0T7',
            },
            {
              value: 145118,
              label: '202450N',
            },
            {
              value: 144880,
              label: '8B59EAX',
            },
            {
              value: 145238,
              label: 'EY3DL2U',
            },
            {
              value: 145168,
              label: 'LT7TZVP',
            },
            {
              value: 145197,
              label: 'M0GHTT1',
            },
            {
              value: 145157,
              label: 'WJV20A8',
            },
            {
              value: 144818,
              label: '3KYQPVW',
            },
            {
              value: 145145,
              label: '6ZU7HEQ',
            },
            {
              value: 145083,
              label: 'RC7TJSM',
            },
            {
              value: 145234,
              label: 'KKGC6BX',
            },
            {
              value: 144889,
              label: 'KR1ECNG',
            },
            {
              value: 145068,
              label: 'KYQA9LE',
            },
            {
              value: 145078,
              label: '723RNDJ',
            },
            {
              value: 145153,
              label: '50B4SGP',
            },
            {
              value: 145377,
              label: 'RRWDP19',
            },
            {
              value: 144855,
              label: 'LCLPALD',
            },
            {
              value: 144946,
              label: 'VRQDA8Y',
            },
            {
              value: 144989,
              label: 'WCL9WX4',
            },
            {
              value: 144952,
              label: 'V7P8S5X',
            },
            {
              value: 145165,
              label: 'L3BXCF1',
            },
            {
              value: 144980,
              label: 'HL44UF2',
            },
            {
              value: 144782,
              label: '15FZR3Q',
            },
            {
              value: 144901,
              label: 'Y8LRJ5S',
            },
            {
              value: 145134,
              label: 'KRWTNDK',
            },
            {
              value: 144767,
              label: 'FHN9PTN',
            },
            {
              value: 144830,
              label: 'TG0K5UY',
            },
            {
              value: 144850,
              label: '0F6PG7C',
            },
            {
              value: 144769,
              label: 'P7VUZKF',
            },
            {
              value: 145094,
              label: '7W96UFS',
            },
            {
              value: 145174,
              label: 'JJG7V87',
            },
            {
              value: 145151,
              label: '3K0YXKB',
            },
            {
              value: 145058,
              label: '0H59VUR',
            },
            {
              value: 145382,
              label: 'JR2DU4U',
            },
            {
              value: 144936,
              label: 'GMNSUFR',
            },
            {
              value: 144988,
              label: 'HACSUMP',
            },
            {
              value: 144962,
              label: '8BSBQLP',
            },
            {
              value: 144878,
              label: '6T10YEY',
            },
            {
              value: 145000,
              label: 'EAT43KV',
            },
            {
              value: 144867,
              label: 'SSAZPRG',
            },
            {
              value: 145032,
              label: 'B5XXEM7',
            },
            {
              value: 145062,
              label: 'M7JRW43',
            },
            {
              value: 144902,
              label: 'L0PJG07',
            },
            {
              value: 145023,
              label: '80T5FHB',
            },
            {
              value: 145025,
              label: 'CFWLE7K',
            },
            {
              value: 144983,
              label: 'FERSE88',
            },
            {
              value: 145047,
              label: 'ZVPVJ4B',
            },
            {
              value: 145034,
              label: 'DQ6E42M',
            },
            {
              value: 145090,
              label: 'K04JGE5',
            },
            {
              value: 145375,
              label: 'HU07A33',
            },
            {
              value: 145102,
              label: 'RYC89DT',
            },
            {
              value: 145024,
              label: 'TKP6EG6',
            },
            {
              value: 144961,
              label: 'DLZS6D8',
            },
            {
              value: 144765,
              label: 'NZJ9ZHA',
            },
            {
              value: 145081,
              label: '0BSHRF1',
            },
            {
              value: 144906,
              label: 'J0GWKC8',
            },
            {
              value: 145019,
              label: 'Q5W1H29',
            },
            {
              value: 145082,
              label: '4156UJU',
            },
            {
              value: 145005,
              label: '01892QN',
            },
            {
              value: 145113,
              label: 'XT551LD',
            },
            {
              value: 145004,
              label: '2W67VJW',
            },
            {
              value: 145060,
              label: 'RQZXNB5',
            },
            {
              value: 145112,
              label: 'XZGB6LM',
            },
            {
              value: 144967,
              label: 'V8TF4DT',
            },
            {
              value: 144794,
              label: 'F3CAY09',
            },
            {
              value: 145378,
              label: 'CR95C6B',
            },
            {
              value: 145086,
              label: 'A9VQ0NV',
            },
            {
              value: 145106,
              label: 'V0CYJMF',
            },
            {
              value: 144795,
              label: '4TF9SDH',
            },
            {
              value: 145009,
              label: '2PC2SY4',
            },
            {
              value: 145061,
              label: '2GSG96P',
            },
            {
              value: 145020,
              label: 'ZZZB0PW',
            },
            {
              value: 144892,
              label: 'ZF542Q9',
            },
            {
              value: 144852,
              label: '6FDXU8T',
            },
            {
              value: 144817,
              label: 'AG8THHR',
            },
            {
              value: 144774,
              label: '4KRJE1V',
            },
            {
              value: 144905,
              label: 'SFP6MRN',
            },
          ],
        },
      },
      {
        key: 'P006Country',
        type: 'enum',
        label: 'P006 Country',
        isArray: false,
        multi: true,
        config: {
          allowCustom: false,
          options: [
            {
              value: 'Afghanistan',
              label: 'Afghanistan',
            },
            {
              value: 'Albania',
              label: 'Albania',
            },
            {
              value: 'Algeria',
              label: 'Algeria',
            },
            {
              value: 'American Samoa',
              label: 'American Samoa',
            },
            {
              value: 'Andorra',
              label: 'Andorra',
            },
            {
              value: 'Angola',
              label: 'Angola',
            },
            {
              value: 'Anguilla',
              label: 'Anguilla',
            },
            {
              value: 'Antarctica',
              label: 'Antarctica',
            },
            {
              value: 'Antigua and Barbuda',
              label: 'Antigua and Barbuda',
            },
            {
              value: 'Argentina',
              label: 'Argentina',
            },
            {
              value: 'Armenia',
              label: 'Armenia',
            },
            {
              value: 'Aruba',
              label: 'Aruba',
            },
            {
              value: 'Australia',
              label: 'Australia',
            },
            {
              value: 'Austria',
              label: 'Austria',
            },
            {
              value: 'Azerbaijan',
              label: 'Azerbaijan',
            },
            {
              value: 'Bahamas, The',
              label: 'Bahamas, The',
            },
            {
              value: 'Bahrain',
              label: 'Bahrain',
            },
            {
              value: 'Bangladesh',
              label: 'Bangladesh',
            },
            {
              value: 'Barbados',
              label: 'Barbados',
            },
            {
              value: 'Belarus',
              label: 'Belarus',
            },
            {
              value: 'Belgium',
              label: 'Belgium',
            },
            {
              value: 'Belize',
              label: 'Belize',
            },
            {
              value: 'Benin',
              label: 'Benin',
            },
            {
              value: 'Bermuda',
              label: 'Bermuda',
            },
            {
              value: 'Bhutan',
              label: 'Bhutan',
            },
            {
              value: 'Bolivia',
              label: 'Bolivia',
            },
            {
              value: 'Bosnia and Herzegovina',
              label: 'Bosnia and Herzegovina',
            },
            {
              value: 'Botswana',
              label: 'Botswana',
            },
            {
              value: 'Bouvet Island',
              label: 'Bouvet Island',
            },
            {
              value: 'Brazil',
              label: 'Brazil',
            },
            {
              value: 'British Indian Ocean Territory',
              label: 'British Indian Ocean Territory',
            },
            {
              value: 'British Virgin Islands',
              label: 'British Virgin Islands',
            },
            {
              value: 'Brunei',
              label: 'Brunei',
            },
            {
              value: 'Bulgaria',
              label: 'Bulgaria',
            },
            {
              value: 'Burkina Faso',
              label: 'Burkina Faso',
            },
            {
              value: 'Burma',
              label: 'Burma',
            },
            {
              value: 'Burundi',
              label: 'Burundi',
            },
            {
              value: 'Cambodia',
              label: 'Cambodia',
            },
            {
              value: 'Cameroon',
              label: 'Cameroon',
            },
            {
              value: 'Canada',
              label: 'Canada',
            },
            {
              value: 'Cape Verde',
              label: 'Cape Verde',
            },
            {
              value: 'Cayman Islands',
              label: 'Cayman Islands',
            },
            {
              value: 'Central African Republic',
              label: 'Central African Republic',
            },
            {
              value: 'Chad',
              label: 'Chad',
            },
            {
              value: 'Chile',
              label: 'Chile',
            },
            {
              value: 'China',
              label: 'China',
            },
            {
              value: 'Christmas Island',
              label: 'Christmas Island',
            },
            {
              value: 'Cocos (Keeling) Islands',
              label: 'Cocos (Keeling) Islands',
            },
            {
              value: 'Colombia',
              label: 'Colombia',
            },
            {
              value: 'Comoros',
              label: 'Comoros',
            },
            {
              value: 'Congo, Democratic Republic of the',
              label: 'Congo, Democratic Republic of the',
            },
            {
              value: 'Congo, Republic of the',
              label: 'Congo, Republic of the',
            },
            {
              value: 'Cook Islands',
              label: 'Cook Islands',
            },
            {
              value: 'Costa Rica',
              label: 'Costa Rica',
            },
            {
              value: "Cote d'Ivoire",
              label: "Cote d'Ivoire",
            },
            {
              value: 'Croatia',
              label: 'Croatia',
            },
            {
              value: 'Cuba',
              label: 'Cuba',
            },
            {
              value: 'Curacao',
              label: 'Curacao',
            },
            {
              value: 'Cyprus',
              label: 'Cyprus',
            },
            {
              value: 'Czech Republic',
              label: 'Czech Republic',
            },
            {
              value: 'Denmark',
              label: 'Denmark',
            },
            {
              value: 'Djibouti',
              label: 'Djibouti',
            },
            {
              value: 'Dominica',
              label: 'Dominica',
            },
            {
              value: 'Dominican Republic',
              label: 'Dominican Republic',
            },
            {
              value: 'Ecuador',
              label: 'Ecuador',
            },
            {
              value: 'Egypt',
              label: 'Egypt',
            },
            {
              value: 'El Salvador',
              label: 'El Salvador',
            },
            {
              value: 'Equatorial Guinea',
              label: 'Equatorial Guinea',
            },
            {
              value: 'Eritrea',
              label: 'Eritrea',
            },
            {
              value: 'Estonia',
              label: 'Estonia',
            },
            {
              value: 'Ethiopia',
              label: 'Ethiopia',
            },
            {
              value: 'Falkland Islands (Islas Malvinas)',
              label: 'Falkland Islands (Islas Malvinas)',
            },
            {
              value: 'Faroe Islands',
              label: 'Faroe Islands',
            },
            {
              value: 'Fiji',
              label: 'Fiji',
            },
            {
              value: 'Finland',
              label: 'Finland',
            },
            {
              value: 'France',
              label: 'France',
            },
            {
              value: 'France, Metropolitan',
              label: 'France, Metropolitan',
            },
            {
              value: 'French Guiana',
              label: 'French Guiana',
            },
            {
              value: 'French Polynesia',
              label: 'French Polynesia',
            },
            {
              value: 'French Southern and Antarctic Lands',
              label: 'French Southern and Antarctic Lands',
            },
            {
              value: 'Gabon',
              label: 'Gabon',
            },
            {
              value: 'Gambia, The',
              label: 'Gambia, The',
            },
            {
              value: 'Gaza Strip',
              label: 'Gaza Strip',
            },
            {
              value: 'Georgia',
              label: 'Georgia',
            },
            {
              value: 'Germany',
              label: 'Germany',
            },
            {
              value: 'Ghana',
              label: 'Ghana',
            },
            {
              value: 'Gibraltar',
              label: 'Gibraltar',
            },
            {
              value: 'Greece',
              label: 'Greece',
            },
            {
              value: 'Greenland',
              label: 'Greenland',
            },
            {
              value: 'Grenada',
              label: 'Grenada',
            },
            {
              value: 'Guadeloupe',
              label: 'Guadeloupe',
            },
            {
              value: 'Guam',
              label: 'Guam',
            },
            {
              value: 'Guatemala',
              label: 'Guatemala',
            },
            {
              value: 'Guernsey',
              label: 'Guernsey',
            },
            {
              value: 'Guinea',
              label: 'Guinea',
            },
            {
              value: 'Guinea-Bissau',
              label: 'Guinea-Bissau',
            },
            {
              value: 'Guyana',
              label: 'Guyana',
            },
            {
              value: 'Haiti',
              label: 'Haiti',
            },
            {
              value: 'Heard Island and McDonald Islands',
              label: 'Heard Island and McDonald Islands',
            },
            {
              value: 'Holy See (Vatican City)',
              label: 'Holy See (Vatican City)',
            },
            {
              value: 'Honduras',
              label: 'Honduras',
            },
            {
              value: 'Hong Kong, China',
              label: 'Hong Kong, China',
            },
            {
              value: 'Hungary',
              label: 'Hungary',
            },
            {
              value: 'Iceland',
              label: 'Iceland',
            },
            {
              value: 'India',
              label: 'India',
            },
            {
              value: 'Indonesia',
              label: 'Indonesia',
            },
            {
              value: 'Iran',
              label: 'Iran',
            },
            {
              value: 'Iraq',
              label: 'Iraq',
            },
            {
              value: 'Ireland',
              label: 'Ireland',
            },
            {
              value: 'Isle of Man',
              label: 'Isle of Man',
            },
            {
              value: 'Israel',
              label: 'Israel',
            },
            {
              value: 'Italy',
              label: 'Italy',
            },
            {
              value: 'Jamaica',
              label: 'Jamaica',
            },
            {
              value: 'Japan',
              label: 'Japan',
            },
            {
              value: 'Jersey',
              label: 'Jersey',
            },
            {
              value: 'Jordan',
              label: 'Jordan',
            },
            {
              value: 'Kazakhstan',
              label: 'Kazakhstan',
            },
            {
              value: 'Kenya',
              label: 'Kenya',
            },
            {
              value: 'Kiribati',
              label: 'Kiribati',
            },
            {
              value: 'Korea, North',
              label: 'Korea, North',
            },
            {
              value: 'Korea, South',
              label: 'Korea, South',
            },
            {
              value: 'Kosovo',
              label: 'Kosovo',
            },
            {
              value: 'Kuwait',
              label: 'Kuwait',
            },
            {
              value: 'Kyrgyzstan',
              label: 'Kyrgyzstan',
            },
            {
              value: 'Laos',
              label: 'Laos',
            },
            {
              value: 'Latvia',
              label: 'Latvia',
            },
            {
              value: 'Lebanon',
              label: 'Lebanon',
            },
            {
              value: 'Lesotho',
              label: 'Lesotho',
            },
            {
              value: 'Liberia',
              label: 'Liberia',
            },
            {
              value: 'Libya',
              label: 'Libya',
            },
            {
              value: 'Liechtenstein',
              label: 'Liechtenstein',
            },
            {
              value: 'Lithuania',
              label: 'Lithuania',
            },
            {
              value: 'Luxembourg',
              label: 'Luxembourg',
            },
            {
              value: 'Macau',
              label: 'Macau',
            },
            {
              value: 'Macedonia',
              label: 'Macedonia',
            },
            {
              value: 'Madagascar',
              label: 'Madagascar',
            },
            {
              value: 'Malawi',
              label: 'Malawi',
            },
            {
              value: 'Malaysia',
              label: 'Malaysia',
            },
            {
              value: 'Maldives',
              label: 'Maldives',
            },
            {
              value: 'Mali',
              label: 'Mali',
            },
            {
              value: 'Malta',
              label: 'Malta',
            },
            {
              value: 'Marshall Islands',
              label: 'Marshall Islands',
            },
            {
              value: 'Martinique',
              label: 'Martinique',
            },
            {
              value: 'Mauritania',
              label: 'Mauritania',
            },
            {
              value: 'Mauritius',
              label: 'Mauritius',
            },
            {
              value: 'Mayotte',
              label: 'Mayotte',
            },
            {
              value: 'Mexico',
              label: 'Mexico',
            },
            {
              value: 'Micronesia, Federated States of',
              label: 'Micronesia, Federated States of',
            },
            {
              value: 'Moldova',
              label: 'Moldova',
            },
            {
              value: 'Monaco',
              label: 'Monaco',
            },
            {
              value: 'Mongolia',
              label: 'Mongolia',
            },
            {
              value: 'Montenegro',
              label: 'Montenegro',
            },
            {
              value: 'Montserrat',
              label: 'Montserrat',
            },
            {
              value: 'Morocco',
              label: 'Morocco',
            },
            {
              value: 'Mozambique',
              label: 'Mozambique',
            },
            {
              value: 'Namibia',
              label: 'Namibia',
            },
            {
              value: 'Nauru',
              label: 'Nauru',
            },
            {
              value: 'Nepal',
              label: 'Nepal',
            },
            {
              value: 'Netherlands',
              label: 'Netherlands',
            },
            {
              value: 'New Caledonia',
              label: 'New Caledonia',
            },
            {
              value: 'New Zealand',
              label: 'New Zealand',
            },
            {
              value: 'Nicaragua',
              label: 'Nicaragua',
            },
            {
              value: 'Niger',
              label: 'Niger',
            },
            {
              value: 'Nigeria',
              label: 'Nigeria',
            },
            {
              value: 'Niue',
              label: 'Niue',
            },
            {
              value: 'Norfolk Island',
              label: 'Norfolk Island',
            },
            {
              value: 'Northern Mariana Islands',
              label: 'Northern Mariana Islands',
            },
            {
              value: 'Norway',
              label: 'Norway',
            },
            {
              value: 'Oman',
              label: 'Oman',
            },
            {
              value: 'Pakistan',
              label: 'Pakistan',
            },
            {
              value: 'Palau',
              label: 'Palau',
            },
            {
              value: 'Panama',
              label: 'Panama',
            },
            {
              value: 'Papua New Guinea',
              label: 'Papua New Guinea',
            },
            {
              value: 'Paraguay',
              label: 'Paraguay',
            },
            {
              value: 'Peru',
              label: 'Peru',
            },
            {
              value: 'Philippines',
              label: 'Philippines',
            },
            {
              value: 'Pitcairn Islands',
              label: 'Pitcairn Islands',
            },
            {
              value: 'Poland',
              label: 'Poland',
            },
            {
              value: 'Portugal',
              label: 'Portugal',
            },
            {
              value: 'Puerto Rico',
              label: 'Puerto Rico',
            },
            {
              value: 'Qatar',
              label: 'Qatar',
            },
            {
              value: 'Reunion',
              label: 'Reunion',
            },
            {
              value: 'Romania',
              label: 'Romania',
            },
            {
              value: 'Russia',
              label: 'Russia',
            },
            {
              value: 'Rwanda',
              label: 'Rwanda',
            },
            {
              value: 'Saint Barthelemy',
              label: 'Saint Barthelemy',
            },
            {
              value: 'Saint Helena, Ascension, and Tristan da Cunha',
              label: 'Saint Helena, Ascension, and Tristan da Cunha',
            },
            {
              value: 'Saint Kitts and Nevis',
              label: 'Saint Kitts and Nevis',
            },
            {
              value: 'Saint Lucia',
              label: 'Saint Lucia',
            },
            {
              value: 'Saint Martin',
              label: 'Saint Martin',
            },
            {
              value: 'Saint Pierre and Miquelon',
              label: 'Saint Pierre and Miquelon',
            },
            {
              value: 'Saint Vincent and the Grenadines',
              label: 'Saint Vincent and the Grenadines',
            },
            {
              value: 'Samoa',
              label: 'Samoa',
            },
            {
              value: 'San Marino',
              label: 'San Marino',
            },
            {
              value: 'Sao Tome and Principe',
              label: 'Sao Tome and Principe',
            },
            {
              value: 'Saudi Arabia',
              label: 'Saudi Arabia',
            },
            {
              value: 'Senegal',
              label: 'Senegal',
            },
            {
              value: 'Serbia',
              label: 'Serbia',
            },
            {
              value: 'Seychelles',
              label: 'Seychelles',
            },
            {
              value: 'Sierra Leone',
              label: 'Sierra Leone',
            },
            {
              value: 'Singapore',
              label: 'Singapore',
            },
            {
              value: 'Sint Maarten',
              label: 'Sint Maarten',
            },
            {
              value: 'Slovakia',
              label: 'Slovakia',
            },
            {
              value: 'Slovenia',
              label: 'Slovenia',
            },
            {
              value: 'Solomon Islands',
              label: 'Solomon Islands',
            },
            {
              value: 'Somalia',
              label: 'Somalia',
            },
            {
              value: 'South Africa',
              label: 'South Africa',
            },
            {
              value: 'South Georgia and the Islands',
              label: 'South Georgia and the Islands',
            },
            {
              value: 'South Sudan',
              label: 'South Sudan',
            },
            {
              value: 'Spain',
              label: 'Spain',
            },
            {
              value: 'Sri Lanka',
              label: 'Sri Lanka',
            },
            {
              value: 'Sudan',
              label: 'Sudan',
            },
            {
              value: 'Suriname',
              label: 'Suriname',
            },
            {
              value: 'Svalbard',
              label: 'Svalbard',
            },
            {
              value: 'Swaziland',
              label: 'Swaziland',
            },
            {
              value: 'Sweden',
              label: 'Sweden',
            },
            {
              value: 'Switzerland',
              label: 'Switzerland',
            },
            {
              value: 'Syria',
              label: 'Syria',
            },
            {
              value: 'Taiwan, China',
              label: 'Taiwan, China',
            },
            {
              value: 'Tajikistan',
              label: 'Tajikistan',
            },
            {
              value: 'Tanzania',
              label: 'Tanzania',
            },
            {
              value: 'Thailand',
              label: 'Thailand',
            },
            {
              value: 'Timor-Leste',
              label: 'Timor-Leste',
            },
            {
              value: 'Togo',
              label: 'Togo',
            },
            {
              value: 'Tokelau',
              label: 'Tokelau',
            },
            {
              value: 'Tonga',
              label: 'Tonga',
            },
            {
              value: 'Trinidad and Tobago',
              label: 'Trinidad and Tobago',
            },
            {
              value: 'Tunisia',
              label: 'Tunisia',
            },
            {
              value: 'Turkey',
              label: 'Turkey',
            },
            {
              value: 'Turkmenistan',
              label: 'Turkmenistan',
            },
            {
              value: 'Turks and Caicos Islands',
              label: 'Turks and Caicos Islands',
            },
            {
              value: 'Tuvalu',
              label: 'Tuvalu',
            },
            {
              value: 'Uganda',
              label: 'Uganda',
            },
            {
              value: 'Ukraine',
              label: 'Ukraine',
            },
            {
              value: 'United Arab Emirates',
              label: 'United Arab Emirates',
            },
            {
              value: 'United Kingdom',
              label: 'United Kingdom',
            },
            {
              value: 'United States',
              label: 'United States',
            },
            {
              value: 'United States Minor Outlying Islands',
              label: 'United States Minor Outlying Islands',
            },
            {
              value: 'Uruguay',
              label: 'Uruguay',
            },
            {
              value: 'Uzbekistan',
              label: 'Uzbekistan',
            },
            {
              value: 'Vanuatu',
              label: 'Vanuatu',
            },
            {
              value: 'Venezuela',
              label: 'Venezuela',
            },
            {
              value: 'Vietnam',
              label: 'Vietnam',
            },
            {
              value: 'Virgin Islands',
              label: 'Virgin Islands',
            },
            {
              value: 'Wallis and Futuna',
              label: 'Wallis and Futuna',
            },
            {
              value: 'West Bank',
              label: 'West Bank',
            },
            {
              value: 'Western Sahara',
              label: 'Western Sahara',
            },
            {
              value: 'Yemen',
              label: 'Yemen',
            },
            {
              value: 'Zambia',
              label: 'Zambia',
            },
            {
              value: 'Zimbabwe',
              label: 'Zimbabwe',
            },
          ],
        },
      },
      {
        key: 'overwrite',
        type: 'boolean',
        label: 'Overwrite',
      },
      {
        key: 'worldlyMaterialId',
        type: 'string',
        label: 'Worldly Material ID',
        description: 'System generated ID',
      },
      {
        type: 'string',
        key: 'T2FacilityRawText',
        description:
          'This field will be used when T2Facility is not a valid enum.',
        label: 't2 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'T3FacilityRawText',
        description:
          'This field will be used when T3Facility is not a valid enum.',
        label: 't3 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'P002FacilityRawText',
        description:
          'This field will be used when P002Facility is not a valid enum.',
        label: 'P002 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'P003FacilityRawText',
        description:
          'This field will be used when P003Facility is not a valid enum.',
        label: 'P003 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'P004FacilityRawText',
        description:
          'This field will be used when P004Facility is not a valid enum.',
        label: 'P004 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'P005FacilityRawText',
        description:
          'This field will be used when P005Facility is not a valid enum.',
        label: 'P005 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
      {
        type: 'string',
        key: 'P006FacilityRawText',
        description:
          'This field will be used when P006Facility is not a valid enum.',
        label: 'P006 facility raw text',
        constraints: [
          {
            type: 'computed',
          },
        ],
        readonly: true,
      },
    ],
  },
] as Flatfile.SheetConfig[]

export default async function (listener: FlatfileListener) {
  listener.namespace(
    ['space:getting-started'],
    reconfigureSpace({
      workbooks: [
        {
          name: 'Example',
          sheets: [
            {
              name: 'Bulk Upload - Material',
              slug: 'bulk-upload-material',
              fields: [
                {
                  key: 'name',
                  type: 'string',
                  label: 'Material Name',
                  description: 'Name of material or material blend.',
                  constraints: [
                    {
                      type: 'required',
                    },
                  ],
                },
              ],
            },
          ],
          actions: [
            {
              operation: 'reconfigure',
              mode: 'foreground',
              label: 'Reconfigure Space',
              primary: true,
            },
          ],
        },
      ],
    })
  )

  listener.namespace(
    ['space:getting-started'],
    configureSpace({
      workbooks: [
        {
          name: 'Example',
          sheets: [
            {
              name: 'Bulk Upload - Material',
              slug: 'bulk-upload-material',
              fields: [
                {
                  key: 'name',
                  type: 'string',
                  label: 'Material Name',
                  description: 'Name of material or material blend.',
                  constraints: [
                    {
                      type: 'required',
                    },
                  ],
                },
              ],
            },
          ],
          actions: [
            {
              operation: 'reconfigure',
              mode: 'foreground',
              label: 'Reconfigure Space',
              primary: true,
            },
          ],
        },
      ],
    })
  )
}
