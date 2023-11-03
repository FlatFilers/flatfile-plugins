import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing';

import { bulkRecordHook } from '../index';

import { defaultSimpleValueData, defaultSimpleValueSchema } from './simpleTestData';

const stringValue = 'bulk';
const intValue = 27;
const booleanValue = false;

jest.setTimeout(10_000);

describe('bulkRecordHook() simple data modification e2e', ()=>{
  const listener = setupListener()

  let spaceId;
  let sheetId;

  beforeAll(async () => {
    const space = await setupSpace();
      spaceId = space.id;
      const workbook = await setupSimpleWorkbook(space.id, defaultSimpleValueSchema);
      sheetId = workbook.sheets[0].id;
  })
  
  afterAll(async () => {
    await deleteSpace(spaceId);
  });

  describe.each([
    bulkRecordHook('test', (records) =>
      records.map((record) => {
        record.set('name', stringValue);
        record.set('age', intValue);
        record.set('alive', booleanValue);
      })
    ),
    bulkRecordHook(
      'test',
      async (records) =>
        await Promise.all(records.map((record) => {
          record.set('name', stringValue);
          record.set('age', intValue);
          record.set('alive', booleanValue);
        }))
    ),
  
  ])('Modifies Records', (fn) => {
  
    beforeEach(async () => {
      listener.use(fn)
    })
  
    it('correctly modifies simple values', async () => {
      await createRecords(sheetId, defaultSimpleValueData);

      await listener.waitFor('commit:created');
      const records = await getRecords(sheetId);

      expect(records[0].values['name']).toMatchObject({ value: stringValue });
      expect(records[1].values['name']).toMatchObject({ value: stringValue });

      expect(records[0].values['age']).toMatchObject({ value: intValue });
      expect(records[1].values['age']).toMatchObject({ value: intValue });

      expect(records[0].values['alive']).toMatchObject({ value: booleanValue });
      expect(records[1].values['alive']).toMatchObject({ value: booleanValue });
    });
  });
});
