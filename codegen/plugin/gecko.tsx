/** @jsx geckoJSX */
/** @jsxFrag geckoJSX */

import { FileFormatter, Folder, Root, geckoJSX } from '@flatfile/gecko'
import prompts from 'prompts'
import { ChangelogFile } from './templates/Changelog'
import { IndexFile } from './templates/IndexFile'
import { PackageJsonFile } from './templates/PackageJson'
import { ReadmeFile } from './templates/Readme'

export default async function () {
  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Name?',
      format: (value: string) => value.trim(),
      validate: (value: string) =>
        value.trim() === '' ? 'A name must be provided' : true,
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description',
      format: (value: string) => (value ? value.trim() : ''),
    },
    {
      type: 'select',
      name: 'category',
      message: 'Category',
      choices: [
        { title: 'Export', value: 'plugin' },
        { title: 'Transform', value: 'transform' },
        { title: 'Automation', value: 'automation' },
        { title: 'Records', value: 'records' },
        { title: 'Extractors', value: 'extractors' },
        { title: 'Utilities', value: 'utilities' },
        { title: 'Core', value: 'core' },
        {
          title: 'Schema Converters',
          value: 'schema-converters',
        },
        { title: 'Connect', value: 'connect' },
        { title: 'Egress', value: 'egress' },
      ],
    },
    {
      type: 'text',
      name: 'job',
      message: 'Job',
      format: (value: string) => value.trim(),
      validate: (value: string) =>
        value.trim() === '' ? 'A job must be provided' : true,
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author',
      format: (value: string) => (value ? value.trim() : ''),
    },
  ])

  console.log(response)

  return (
    <Root path={`../../plugins/${response.name}`} erase>
      <FileFormatter formatter='prettier' match='*.{js,ts,yaml}'>
        <Folder name='src'>
          <IndexFile job={response.job} />
        </Folder>
        <PackageJsonFile
          pluginName={response.name}
          description={response.description}
          category={response.category}
          author={response.author}
        />
        <ReadmeFile pluginName={response.name} />
        <ChangelogFile pluginName={response.name} />
      </FileFormatter>
    </Root>
  )
}
