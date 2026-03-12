import { defineSchema, generateSchemas } from 'schema';
import {
  createEntities,
  updateEntities,
  updateEntityId,
  deleteEntities,
} from 'helpers';


describe('@Helpers', function () {
  describe('createEntities(schema, dataPath, action)', function () {
    let schemas;
    beforeAll(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => createEntities()).toThrow(/INVALID SCHEMA/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => createEntities(User)).toThrow(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => createEntities(User, 'payload.data')).toThrow(/INVALID ACTION/);
      expect(() => createEntities(User, 'payload.data', { asd: 'asdfa' })).toThrow(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result).toHaveProperty('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.type).toBe(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).toHaveProperty('isEntmanAction');
      expect(result.meta.isEntmanAction).toBe(true);
    });
    it('should add a meta property called `type` with the value `CREATE_ENTITIES` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).toHaveProperty('type');
      expect(result.meta.type).toBe('CREATE_ENTITIES');
    });
    it('should add a meta property called `dataPath` with the right value to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).toHaveProperty('dataPath');
      expect(result.meta.dataPath).toBe('payload.data');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).toHaveProperty('schema');
      expect(result.meta.schema.key).toBe('User');
    });
  });
  describe('updateEntities(schema, ids, dataPath, action)', function () {
    let schemas;
    let type;
    let action;
    beforeAll(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
      const { User } = schemas;
      type = 'TEST_TYPE';
      const updateUsers = (ids, data) => updateEntities(User, ids, 'payload.data', {
        type,
        payload: { data }
      });
      action = updateUsers([ 1 ], [{ name: 'Lars' }]);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => updateEntities()).toThrow(/INVALID SCHEMA/);
    });
    it('should throw an error when `ids` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntities(User)).toThrow(/INVALID IDS/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntities(User, [ 1 ])).toThrow(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => updateEntities(User, [ 1 ], 'payload.data')).toThrow(/INVALID ACTION/);
      expect(() => updateEntities(User, [ 1 ], 'payload.data', { asd: 'asdfa' })).toThrow(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).toHaveProperty('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).toBe(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('isEntmanAction');
      expect(action.meta.isEntmanAction).toBe(true);
    });
    it('should add a meta property called `type` with the value `UPDATE_ENTITIES` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('type');
      expect(action.meta.type).toBe('UPDATE_ENTITIES');
    });
    it('should add a meta property called `dataPath` with the right value to the wrapped action', function () {
      expect(action.meta).toHaveProperty('dataPath');
      expect(action.meta.dataPath).toBe('payload.data');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).toHaveProperty('schema');
      expect(action.meta.schema.key).toBe('User');
    });
    it('should add a meta property called `ids` with the ids to the wrapped action', function () {
      expect(action.meta).toHaveProperty('ids');
      expect(action.meta.ids).toEqual([ 1 ]);
    });
  });
  describe('updateEntityId(schema, oldId, newId, action)', function () {
    let schemas;
    let action;
    let type;
    beforeAll(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
      const { User } = schemas;
      type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      action = updateUserId(1, 2);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => updateEntityId()).toThrow(/INVALID SCHEMA/);
    });
    it('should throw an error when `oldId` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User)).toThrow(/INVALID OLD ID/);
    });
    it('should throw an error when `newId` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User, 1)).toThrow(/INVALID NEW ID/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User, 1, 2)).toThrow(/INVALID ACTION/);
      expect(() => updateEntityId(User, 1, 2, { asd: 'asdfa' })).toThrow(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).toHaveProperty('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).toBe(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('isEntmanAction');
      expect(action.meta.isEntmanAction).toBe(true);
    });
    it('should add a meta property called `type` with the value `UPDATE_ENTITY_ID` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('type');
      expect(action.meta.type).toBe('UPDATE_ENTITY_ID');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).toHaveProperty('schema');
      expect(action.meta.schema.key).toBe('User');
    });
    it('should add a meta property called `oldId` with the oldId to the wrapped action', function () {
      expect(action.meta).toHaveProperty('oldId');
      expect(action.meta.oldId).toBe(1);
    });
    it('should add a meta property called `newId` with the newId to the wrapped action', function () {
      expect(action.meta).toHaveProperty('newId');
      expect(action.meta.newId).toBe(2);
    });
  });
  describe('deleteEntities(schema, id, action)', function () {
    let schemas;
    let action;
    let type;
    beforeAll(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
      const { User } = schemas;
      type = 'TEST_ACTION';
      const deleteUser = (ids) => deleteEntities(User, ids, { type });
      action = deleteUser([ 1 ]);
    });
    it('should return an error when `schema` is not a valid schema', function () {
      expect(() => deleteEntities()).toThrow(/INVALID SCHEMA/);
    });
    it('should return an error when `id` is empty', function () {
      const { User } = schemas;
      expect(() => deleteEntities(User)).toThrow(/INVALID ID/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => deleteEntities(User, 1)).toThrow(/INVALID ACTION/);
      expect(() => deleteEntities(User, 1, { asd: 'asdfa' })).toThrow(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).toHaveProperty('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).toBe(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('isEntmanAction');
      expect(action.meta.isEntmanAction).toBe(true);
    });
    it('should add a meta property called `type` with the value `DELETE_ENTITIES` to the wrapped action', function () {
      expect(action.meta).toHaveProperty('type');
      expect(action.meta.type).toBe('DELETE_ENTITIES');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).toHaveProperty('schema');
      expect(action.meta.schema.key).toBe('User');
    });
    it('should add a meta property called `ids` with the ids to the wrapped action', function () {
      expect(action.meta).toHaveProperty('ids');
      expect(action.meta.ids).toEqual([ 1 ]);
    });
  });
});
