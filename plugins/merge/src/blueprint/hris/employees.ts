import { Flatfile } from '@flatfile/api'

export const employees: Flatfile.SheetConfig = {
  name: 'Employees',
  slug: 'employees',
  readonly: true,
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
      // constraints: [{ type: 'required' }],
    },
    {
      key: 'remote_id',
      label: 'Remote ID',
      type: 'string',
    },
    {
      key: 'employeeNumber',
      label: 'Employee number',
      description:
        "The employee's number that appears in the remote UI. Note: This is distinct from the remote_id field, which is a unique identifier for the employee set by the remote API, and is not exposed to the user.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'company',
      label: 'Company',
      type: 'string',
    },
    {
      key: 'firstName',
      label: 'First name',
      description: "The employee's first name.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'lastName',
      label: 'Last name',
      description: "The employee's last name.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'preferredName',
      label: 'Preferred name',
      description: "The employee's preferred name name.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'displayFullName',
      label: 'Display full name',
      description: "The employee's display full name.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'username',
      label: 'Username',
      description: "The employee's username.",
      constraints: [],
      type: 'string',
    },
    // groups: Array
    {
      key: 'workEmail',
      label: 'Work email',
      description: "The employee's work email.",
      // constraints: [{ type: 'required' }],
      type: 'string',
    },
    {
      key: 'personalEmail',
      label: 'Personal email',
      description: "The employee's personal email.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'mobilePhoneNumber',
      label: 'Mobile phone number',
      description: "The employee's mobile phone number.",
      constraints: [],
      type: 'string',
    },
    // employments: Employment[]
    {
      key: 'homeLocation',
      label: 'Home location',
      description: 'home_location field on hris.Employee object',
      constraints: [],
      type: 'string',
    },
    {
      key: 'workLocation',
      label: 'Work location',
      description: 'work_location field on hris.Employee object',
      constraints: [],
      type: 'string',
    },
    {
      key: 'manager',
      label: 'manager',
      description: 'manager field on hris.Employee object',
      constraints: [],
      type: 'string',
    },
    {
      key: 'team',
      label: 'team',
      description: 'team field on hris.Employee object',
      constraints: [],
      type: 'string',
    },
    {
      key: 'payGroup',
      label: 'Pay group',
      type: 'string',
    },
    {
      key: 'ssn',
      label: 'SSN',
      description: "The employee's social security number.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'gender',
      label: 'gender',
      description: "The employee's gender.",
      constraints: [],
      type: 'enum',
      config: {
        options: [
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
          { label: 'Non-binary', value: 'NON-BINARY' },
          { label: 'Other', value: 'OTHER' },
          {
            label: 'Prefer Not To Disclose',
            value: 'PREFER_NOT_TO_DISCLOSE',
          },
        ],
      },
    },
    {
      key: 'ethnicity',
      label: 'Ethnicity',
      description: "The employee's ethnicity.",
      constraints: [],
      type: 'enum',
      config: {
        options: [
          {
            label: 'American Indian Or Alaska Native',
            value: 'AMERICAN_INDIAN_OR_ALASKA_NATIVE',
          },
          {
            label: 'Asian Or Indian Subcontinent',
            value: 'ASIAN_OR_INDIAN_SUBCONTINENT',
          },
          {
            label: 'Black Or African American',
            value: 'BLACK_OR_AFRICAN_AMERICAN',
          },
          { label: 'Hispanic Or Latino', value: 'HISPANIC_OR_LATINO' },
          {
            label: 'Native Hawaiian Or Other Pacific Islander',
            value: 'NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER',
          },
          { label: 'Two Or More Races', value: 'TWO_OR_MORE_RACES' },
          { label: 'White', value: 'WHITE' },
          {
            label: 'Prefer Not To Disclose',
            value: 'PREFER_NOT_TO_DISCLOSE',
          },
        ],
      },
    },
    {
      key: 'maritalStatus',
      label: 'Marital status',
      description: "The employee's marital status.",
      constraints: [],
      type: 'enum',
      config: {
        options: [
          { label: 'Single', value: 'SINGLE' },
          {
            label: 'Married Filing Jointly',
            value: 'MARRIED_FILING_JOINTLY',
          },
          {
            label: 'Married Filing Separately',
            value: 'MARRIED_FILING_SEPARATELY',
          },
          { label: 'Head Of Household', value: 'HEAD_OF_HOUSEHOLD' },
          {
            label: 'Qualifying Widow Or Widower With Dependent Child',
            value: 'QUALIFYING_WIDOW_OR_WIDOWER_WITH_DEPENDENT_CHILD',
          },
        ],
      },
    },
    {
      key: 'dateOfBirth',
      label: 'Date of birth',
      description: "The employee's date of birth.",
      constraints: [],
      type: 'date',
    },
    {
      key: 'startDate',
      label: 'Start date',
      description:
        'The date that the employee started working. If an employee has multiple start dates from previous employments, this represents the most recent start date.',
      constraints: [],
      type: 'date',
    },
    {
      key: 'remoteCreatedAt',
      label: 'Remote created at',
      description: "When the third party's employee was created.",
      constraints: [],
      type: 'date',
    },
    {
      key: 'employmentStatus',
      label: 'Employment status',
      description: 'The employment status of the employee.',
      constraints: [],
      type: 'enum',
      config: {
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Inactive', value: 'INACTIVE' },
        ],
      },
    },
    {
      key: 'terminationDate',
      label: 'Termination date',
      description: "The employee's termination date.",
      constraints: [],
      type: 'date',
    },
    {
      key: 'avatar',
      label: 'Avatar',
      description: "The URL of the employee's avatar image.",
      constraints: [],
      type: 'string',
    },
    {
      key: 'remote_was_deleted',
      label: 'Remote was deleted',
      type: 'boolean',
      // constraints: [{ type: 'required' }],
    },
    {
      key: 'modified_at',
      label: 'Modified at',
      type: 'string',
      // constraints: [{ type: 'required' }],
    },
    // field_mappings: Object
    // remote_data: RemoteData[]
  ],
}
