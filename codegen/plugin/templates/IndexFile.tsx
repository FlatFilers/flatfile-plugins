/** @jsx geckoJSX */
/** @jsxFrag geckoJSX */

import { File, Text, geckoJSX } from '@flatfile/gecko'

export function IndexFile(props: { job: string }) {
  return (
    <File name="index.ts">
      <Text>{`import type { Flatfile } from '@flatfile/api'`}</Text>
      <Text>{`import type { FlatfileEvent } from '@flatfile/listener'`}</Text>
      <Text />
      <Text>{`import { FlatfileClient } from '@flatfile/api'`}</Text>
      <Text>{`import { jobHandler } from '@flatfile/plugin-job-handler'`}</Text>
      <Text />
      <Text>const api = new FlatfileClient()</Text>
      <Text />
      <Text>
        {`export default jobHandler(
  '${props.job}',
  async (
    event: FlatfileEvent,
    tick: (
      progress: number,
      message?: string
    ) => Promise<Flatfile.JobResponse>
  ) => {
  }
)`}
      </Text>
      <Text />
    </File>
  )
}
