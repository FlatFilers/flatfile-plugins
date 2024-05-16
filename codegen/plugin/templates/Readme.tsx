/** @jsx geckoJSX */
/** @jsxFrag geckoJSX */

import { File, Text, geckoJSX } from '@flatfile/gecko'

export function ReadmeFile(props: { pluginName: string }) {
  return (
    <File name="README.md">
      <Text>
        {`# @flatfile/plugin-${props.pluginName}`}
      </Text>
    </File>
  )
}
