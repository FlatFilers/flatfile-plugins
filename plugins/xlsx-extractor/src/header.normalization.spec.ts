import api from '@flatfile/api'
import { 
  setupListener,
  setupSpace,
  getEnvironmentId,
} from '@flatfile/utils-testing'
import { ExcelExtractor } from '.'
import fs from 'fs'
import path from 'path'
import { FlatfileEvent } from '@flatfile/listener'

describe('xlsx-extractor plugin', () => {

  const listener = setupListener()
  let spaceId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
  })
  afterAll(async () => {
    await api.spaces.delete(spaceId)
  })

  beforeEach(async () => {
    listener.use(ExcelExtractor())
  })

  it('Upload file with headers that require normalization', async () => {

    listener.on("**", async (event: FlatfileEvent) => {
      console.log(event.topic)
    })

    await api.files.upload(fs.createReadStream(path.join(__dirname,'../ref/test-headers.xlsx')), {
      environmentId: getEnvironmentId(),
      spaceId,
    })

    const failure = async () => {
      await listener.waitFor("job:failed", 1)
      return false
    }
    const success = async () => {
      await listener.waitFor("sheet:counts-updated", 3)
      return true
    }

    const ok = await Promise.race([failure(), success()])
    if(!ok) {
      throw new Error("Job should not fail")
    } else {
      const { data: workbooks } = await api.workbooks.list({spaceId})
      expect(workbooks.length).toBe(1)  
      const { data: sheets } = await api.sheets.list({workbookId: workbooks[0].id})
      expect(sheets.length).toBe(1)
      const EXPECTED_FIELDS = [{
        "description": "",
        "key": "Code",
        "label": "Code",
        "type": "string",
      },
      {
        "description": "",
        "key": "Amount_DOLLAR_",
        "label": "Amount_DOLLAR_",
        "type": "string",
      },
      {
        "description": "",
        "key": "Amount_DOLLAR__1",
        "label": "Amount_DOLLAR__1",
        "type": "string",
      },
      {
        "description": "",
        "key": "Rate_PERCENT_",
        "label": "Rate_PERCENT_",
        "type": "string",
      },
      {
        "description": "",
        "key": "empty",
        "label": "empty",
        "type": "string",
      },
      {
        "description": "",
        "key": "empty_1",
        "label": "empty_1",
        "type": "string",
      }]

      expect(sheets[0].config.fields).toEqual(EXPECTED_FIELDS)
      
      const { data: { records } } = await api.records.get(sheets[0].id)
      expect(records.length).toBe(2)
      const data = records.map((record) => 
        EXPECTED_FIELDS.reduce((acc, field) => {
          acc[field.key] = record.values[field.key].value
          return acc
        }, {})
      )
      expect(data).toEqual([
        {
        "Amount_DOLLAR_": "100",
        "Amount_DOLLAR__1": "300",
        "Code": "ABC",
        "Rate_PERCENT_": "5%",
        "empty": undefined,
        "empty_1": undefined,
        },
        {
          "Amount_DOLLAR_": "200",
          "Amount_DOLLAR__1": "400",
          "Code": "DEF",
          "Rate_PERCENT_": "3%",
          "empty": undefined,
          "empty_1": undefined,
        },
      ])

    }
   
  })

})


