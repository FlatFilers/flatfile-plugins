import { Flatfile } from '@flatfile/api'

export const contactsSheet: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
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
  ],
  actions: [
    {
      operation: 'submitData',
      mode: 'foreground',
      label: 'Submit',
      description: 'Submit contact data',
      primary: true,
    },
  ],
}

export const updatedContactsSheet: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
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
      label: 'Email Address', // Updated label
    },
    {
      key: 'phone', // New field
      type: 'string',
      label: 'Phone Number',
    },
  ],
  actions: [
    {
      operation: 'submitData',
      mode: 'foreground',
      label: 'Submit Updated',
      description: 'Submit updated contact data',
      primary: true,
    },
  ],
}

export const companiesSheet: Flatfile.SheetConfig = {
  name: 'Companies',
  slug: 'companies',
  fields: [
    {
      key: 'name',
      type: 'string',
      label: 'Company Name',
    },
    {
      key: 'website',
      type: 'string',
      label: 'Website',
    },
  ],
  actions: [
    {
      operation: 'validateData',
      mode: 'background',
      label: 'Validate',
      description: 'Validate company data',
    },
  ],
}
