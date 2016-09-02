import { expect } from 'chai';

import { defineSchema, generateSchemas } from 'schema';
import {
  createEntity,
  updateEntity,
  updateEntityId,
  deleteEntity,
} from 'helpers';


describe('@Helpers', function () {
  describe('createEntity(schema, dataPath, action)', function () {
    let schemas;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => createEntity()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => createEntity(User)).to.throw(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => createEntity(User, 'payload.data')).to.throw(/INVALID ACTION/);
      expect(() => createEntity(User, 'payload.data', { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUser = (data) => createEntity(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUser({ name: 'Lars' });
      expect(result).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUser = (data) => createEntity(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUser({ name: 'Lars' });
      expect(result.type).to.equal(type);
    });
    it('should add a meta property called `entityAction` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUser = (data) => createEntity(User, 'payload.data', {
        type,
        payload: { data },
      });
      const result = createUser({ name: 'Lars' });
      expect(result.meta).to.contain.key('entityAction');
    });
    it('the `entityAction` should have the type `CREATE_ENTITY`', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const createUser = (data) => createEntity(User, 'payload.data', {
        type,
        payload: { data },
      });
      const action = createUser({ name: 'Lars' });
      const result = action.meta.entityAction;
      expect(result.type).to.equal('CREATE_ENTITY');
    });
  });
  describe('updateEntity(schema, id, dataPath, action)', function () {
    let schemas;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
    });
    it('should throw an error when `schema` is not a valid schema', function () {
      expect(() => updateEntity()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error when `id` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntity(User)).to.throw(/INVALID ID/);
    });
    it('should throw an error when `dataPath` is empty', function () {
      const { User } = schemas;
      expect(() => updateEntity(User, 1)).to.throw(/INVALID DATA PATH/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => updateEntity(User, 1, 'payload.data')).to.throw(/INVALID ACTION/);
      expect(() => updateEntity(User, 1, 'payload.data', { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUser = (id, data) => updateEntity(User, 1, 'payload.data', {
        type,
        payload: { id, data }
      });
      const result = updateUser(1, { name: 'Lars' });
      expect(result).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUser = (id, data) => updateEntity(User, 1, 'payload.data', {
        type,
        payload: { id, data }
      });
      const result = updateUser(1, { name: 'Lars' });
      expect(result.type).to.equal(type);
    });
    it('should add a meta property called `entityAction` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUser = (id, data) => updateEntity(User, 1, 'payload.data', {
        type,
        payload: { id, data }
      });
      const result = updateUser(1, { name: 'Lars' });
      expect(result.meta).to.contain.key('entityAction');
    });
    it('the `entityAction` should have the type `UPDATE_ENTITY`', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUser = (id, data) => updateEntity(User, 1, 'payload.data', {
        type,
        payload: { id, data }
      });
      const action = updateUser(1, { name: 'Lars' });
      const result = action.meta.entityAction;
      expect(result.type).to.equal('UPDATE_ENTITY');
    });
  });
  describe('updateEntityId(schema, newId, oldId, action)', function () {
    let schemas;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
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
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      const result = updateUserId(1, 2);
      expect(result).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      const result = updateUserId(1, 2);
      expect(result.type).to.equal(type);
    });
    it('should add a meta property called `entityAction` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      const result = updateUserId(1, 2);
      expect(result.meta).to.contain.key('entityAction');
    });
    it('the `entityAction` should have the type `UPDATE_ENTITY_ID`', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const updateUserId = (oldId, newId) => updateEntityId(User, oldId, newId, { type });
      const action = updateUserId(1, 2);
      const result = action.meta.entityAction;
      expect(result.type).to.equal('UPDATE_ENTITY_ID');
    });
  });
  describe('deleteEntity(schema, id, action)', function () {
    let schemas;
    before(function () {
      const user = defineSchema('User');
      schemas = generateSchemas([user]);
    });
    it('should return an error when `schema` is not a valid schema', function () {
      expect(() => deleteEntity()).to.throw(/INVALID SCHEMA/);
    });
    it('should return an error when `id` is empty', function () {
      const { User } = schemas;
      expect(() => deleteEntity(User)).to.throw(/INVALID ID/);
    });
    it('should throw an error when invalid `action`', function () {
      const { User } = schemas;
      expect(() => deleteEntity(User, 1)).to.throw(/INVALID ACTION/);
      expect(() => deleteEntity(User, 1, { asd: 'asdfa' })).to.throw(/INVALID ACTION/);
    });
    it('should return a valid action object', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const deleteUser = (id) => deleteEntity(User, id, { type });
      const result = deleteUser(1);
      expect(result).to.contain.key('type');
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const deleteUser = (id) => deleteEntity(User, id, { type });
      const result = deleteUser(1);
      expect(result.type).to.equal(type);
    });
    it('should add a meta property called `entityAction` to the wrapped action', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const deleteUser = (id) => deleteEntity(User, id, { type });
      const result = deleteUser(1);
      expect(result.meta).to.contain.key('entityAction');
    });
    it('the `entityAction` should have the type `DELETE_ENTITY`', function () {
      const { User } = schemas;
      const type = 'TEST_ACTION';
      const deleteUser = (id) => deleteEntity(User, id, { type });
      const action = deleteUser(1);
      const result = action.meta.entityAction;
      expect(result.type).to.equal('DELETE_ENTITY');
    });
  });
});
