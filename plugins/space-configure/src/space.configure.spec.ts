import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import { gettingStartedSheet } from '../ref/getting_started'
import { SetupFactory, configureSpace } from '.'

const setup: SetupFactory = {
  workbook: {
    name: 'Playground',
    labels: ['Swingset', 'Slide', 'See Saw', 'Monkey Bars'],
    sheets: [gettingStartedSheet],
    actions: [
      {
        operation: 'submitActionFg',
        mode: 'foreground',
        label: 'Submit data',
        type: 'string',
        description: 'Submit this data to a webhook.',
        primary: true,
      },
      {
        operation: 'duplicateWorkbook',
        mode: 'foreground',
        label: 'Duplicate',
        description: 'Duplicate this workbook.',
      },
    ],
  },
}

describe('SpaceConfigure plugin e2e tests', () => {
  const listener = setupListener()
  let spaceId: string

  beforeAll(async () => {
    listener.use(configureSpace(setup))

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('should configure a space', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    expect(true).toBe(true)
  })
})
