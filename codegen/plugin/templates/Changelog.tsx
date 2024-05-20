/** @jsx geckoJSX */
/** @jsxFrag geckoJSX */

import { File, Text, geckoJSX } from '@flatfile/gecko'

export function ChangelogFile(props: {
  pluginName: string
}) {
  return (
    <File name="CHANGELOG.md">
      <Text>
        {`# @flatfile/plugin-${props.pluginName}`}
      </Text>
    </File>
  )
}
