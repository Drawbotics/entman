import { expect } from 'chai';

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
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => createEntities()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => createEntities(User)).to.throw(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => createEntities(User, 'payload.data')).to.throw(/INVALID ACTION/);
      expect(() => createEntities(User, 'payload.data', { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.type).to.equal(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).to.contain.key('isEntmanAction');
      expect(result.meta.isEntmanAction).to.be.true;
    });
    it('should add a meta property called `type` with the value `CREATE_ENTITIES` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).to.contain.key('type');
      expect(result.meta.type).to.equal('CREATE_ENTITIES');
    });
    it('should add a meta property called `dataPath` with the right value to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).to.contain.key('dataPath');
      expect(result.meta.dataPath).to.equal('payload.data');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUsers = (data) => createEntities(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUsers([{ name: 'Lars' }]);
      expect(result.meta).to.contain.key('schema');
      expect(result.meta.schema.key).to.equal('User');
    });
  });
  describe('updateEntities(schema, ids, dataPath, action)', function () {
    let schemas;
    let type;
    let action;
    before(function () {
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
      expect(() => updateEntities()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error when `ids` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntities(User)).to.throw(/INVALID IDS/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntities(User, [ 1 ])).to.throw(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => updateEntities(User, [ 1 ], 'payload.data')).to.throw(/INVALID ACTION/);
      expect(() => updateEntities(User, [ 1 ], 'payload.data', { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).to.equal(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).to.contain.key('isEntmanAction');
      expect(action.meta.isEntmanAction).to.be.true;
    });
    it('should add a meta property called `type` with the value `UPDATE_ENTITIES` to the wrapped action', function () {
      expect(action.meta).to.contain.key('type');
      expect(action.meta.type).to.equal('UPDATE_ENTITIES');
    });
    it('should add a meta property called `dataPath` with the right value to the wrapped action', function () {
      expect(action.meta).to.contain.key('dataPath');
      expect(action.meta.dataPath).to.equal('payload.data');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).to.contain.key('schema');
      expect(action.meta.schema.key).to.equal('User');
    });
    it('should add a meta property called `ids` with the ids to the wrapped action', function () {
      expect(action.meta).to.contain.key('ids');
      expect(action.meta.ids).to.deep.equal([ 1 ]);
    });
  });
  describe('updateEntityId(schema, newId, oldId, action)', function () {
    let schemas;
    let action;
    let type;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
      const { User } = schemas;
      type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      action = updateUserId(1, 2);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => updateEntityId()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error when `oldId` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User)).to.throw(/INVALID OLD ID/);
    });
    it('should throw an error when `newId` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User, 1)).to.throw(/INVALID NEW ID/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => updateEntityId(User, 1, 2)).to.throw(/INVALID ACTION/);
      expect(() => updateEntityId(User, 1, 2, { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).to.equal(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).to.contain.key('isEntmanAction');
      expect(action.meta.isEntmanAction).to.be.true;
    });
    it('should add a meta property called `type` with the value `UPDATE_ENTITY_ID` to the wrapped action', function () {
      expect(action.meta).to.contain.key('type');
      expect(action.meta.type).to.equal('UPDATE_ENTITY_ID');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).to.contain.key('schema');
      expect(action.meta.schema.key).to.equal('User');
    });
    it('should add a meta property called `oldId` with the oldId to the wrapped action', function () {
      expect(action.meta).to.contain.key('oldId');
      expect(action.meta.oldId).to.equal(1);
    });
    it('should add a meta property called `newId` with the newId to the wrapped action', function () {
      expect(action.meta).to.contain.key('newId');
      expect(action.meta.newId).to.equal(2);
    });
  });
  describe('deleteEntities(schema, id, action)', function () {
    let schemas;
    let action;
    let type;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
      const { User } = schemas;
      type = 'TEST_ACTION';
      const deleteUser = (ids) => deleteEntities(User, ids, { type });
      action = deleteUser([ 1 ]);
    });
    it('should return an error when `schema` is not a valid schema', function () {
      expect(() => deleteEntities()).to.throw(/INVALID SCHEMA/);
    });
    it('should return an error when `id` is empty', function () {
      const { User } = schemas;
      expect(() => deleteEntities(User)).to.throw(/INVALID ID/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => deleteEntities(User, 1)).to.throw(/INVALID ACTION/);
      expect(() => deleteEntities(User, 1, { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      expect(action).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      expect(action.type).to.equal(type);
    });
    it('should add a meta property called `isEntmanAction` with the value `true` to the wrapped action', function () {
      expect(action.meta).to.contain.key('isEntmanAction');
      expect(action.meta.isEntmanAction).to.be.true;
    });
    it('should add a meta property called `type` with the value `DELETE_ENTITIES` to the wrapped action', function () {
      expect(action.meta).to.contain.key('type');
      expect(action.meta.type).to.equal('DELETE_ENTITIES');
    });
    it('should add a meta property called `schema` with the schema to the wrapped action', function () {
      expect(action.meta).to.contain.key('schema');
      expect(action.meta.schema.key).to.equal('User');
    });
    it('should add a meta property called `ids` with the ids to the wrapped action', function () {
      expect(action.meta).to.contain.key('ids');
      expect(action.meta.ids).to.deep.equal([ 1 ]);
    });
  });
});
