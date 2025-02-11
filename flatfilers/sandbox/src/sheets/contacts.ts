import type { Flatfile } from '@flatfile/api'

export const contacts: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
  allowAdditionalFields: true,
  fields: [
    {
      key: 'firstName',
      type: 'string',
      label: 'First Name',
      constraints: [
        { type: 'required' },
        { type: 'unique', config: { caseSensitive: false } },
      ],
    },
    {
      key: 'lastName',
      type: 'string',
      label: 'Last Name',
      // constraints: [
      //   { type: 'external', validator: 'length', config: { max: 10 } },
      // ],
    },
    {
      key: 'email',
      type: 'string',
      label: 'Email',
      // constraints: [
      //   {
      //     type: 'external',
      //     validator: 'email',
      //     config: { emailRegex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      //   },
      // ],
    },
    {
      key: 'dob',
      type: 'date',
      label: 'DOB',
    },
    {
      key: 'hireDate',
      type: 'date',
      label: 'Hire Date',
    },
  ],
  // actions: [
  //   {
  //     operation: 'duplicateSheet',
  //     mode: 'foreground',
  //     label: 'Duplicate',
  //     description: 'Duplicate this sheet.',
  //   },
  //   {
  //     operation: 'dedupeEmail',
  //     mode: 'background',
  //     label: 'Dedupe emails',
  //     description: 'Remove duplicate emails',
  //   },
  //   {
  //     operation: 'processRecords',
  //     mode: 'foreground',
  //     label: 'Process Records',
  //   },
  //   {
  //     operation: 'submitLargeSheet',
  //     mode: 'foreground',
  //     label: 'Submit Large Sheet',
  //     type: 'string',
  //     description: 'Split sheet up into parts and submit',
  //     primary: true,
  //   },
  // ],
  // constraints: [
  //   {
  //     name: "foo';--",
  //     fields: ['firstName', 'lastName'],
  //     type: 'unique',
  //     strategy: 'concat',
  //   },
  // ],
}
