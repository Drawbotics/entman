import { expect } from 'chai';
import { normalize } from 'normalizr';

import { defineSchema, generateSchemas } from 'schema';
import {
  createEntity,
  CREATE_ENTITY,
  updateEntity,
  UPDATE_ENTITY,
  deleteEntity,
  DELETE_ENTITY,
  updateEntityId,
  UPDATE_ENTITY_ID,
} from 'actions';


describe('@Actions', function () {
  let schemas;
  before(function () {
    const cart = defineSchema('Cart');
    schemas = generateSchemas([cart]);
  });
  describe('createEntity(schema, data)', function () {
    it('should return an action object of type CREATE_ENTITY', function () {
      const { Cart } = schemas;
      const result = createEntity(Cart, {});
      expect(result.type).to.equal(CREATE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const { Cart } = schemas;
      const result = createEntity(Cart, {});
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the name of the entity in the payload', function () {
      const { Cart } = schemas;
      const data = { foo: 'bar' };
      const result = createEntity(Cart, data);
      expect(result.payload.name).to.equal('Cart');
    });
    it('should include the data normalized in the payload', function () {
      const { Cart } = schemas;
      const data = { foo: 'bar', id: 1 };
      const result = createEntity(Cart, data);
      expect(result.payload.data).to.deep.equal(normalize(data, Cart));
    });
    it('should generate an id if it\'s not present in the data', function () {
      const { Cart } = schemas;
      const data = { foo: 'bar' };
      const result = createEntity(Cart, data);
      expect(result.payload._rawData).to.contain.key('id');
    });
    it('should keep the id present in the data', function () {
      const { Cart } = schemas;
      const id = 1;
      const data = { foo: 'bar', id };
      const result = createEntity(Cart, data);
      expect(result.payload._rawData.id).to.equal(id);
    });
  });
  describe('updateEntity(schema, id, data)', function () {
    it('should return an action object of type UPDATE_ENTITY', function () {
      const { Cart } = schemas;
      const result = updateEntity(Cart, 1231, { foo: 'bar' });
      expect(result.type).to.equal(UPDATE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const { Cart } = schemas;
      const result = updateEntity(Cart, 1231, {});
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the id of the entity, the name of the entity and the data in the payload', function () {
      const { Cart } = schemas;
      const result = updateEntity(Cart, 123, { foo: 'bar' });
      expect(result.payload.name).to.equal('Cart');
    });
    it('should include the id of the entity in the payload', function () {
      const { Cart } = schemas;
      const id = 1231;
      const result = updateEntity(Cart, id, { foo: 'bar' });
      expect(result.payload.id).to.equal(id);
    });
    it('should include the data in the payload', function () {
      const { Cart } = schemas;
      const id = 123;
      const data = { foo: 'bar' };
      const result = updateEntity(Cart, id, data);
      expect(result.payload.data).to.deep.equal(normalize({ id, ...data }, Cart));
    });
  });
  describe('updateEntityId(schema, newId, oldId)', function () {
    it('should return an action object of type UPDATE_ENTITY_ID', function () {
      const { Cart } = schemas;
      const result = updateEntityId(Cart, 1, 2);
      expect(result.type).to.equal(UPDATE_ENTITY_ID);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const { Cart } = schemas;
      const result = updateEntityId(Cart, 1, 2);
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the name of the entity in the payload', function () {
      const { Cart } = schemas;
      const result = updateEntityId(Cart, 1, 2);
      expect(result.payload.name).to.equal('Cart');
    });
    it('should include the oldId of the entity in the payload', function () {
      const { Cart } = schemas;
      const oldId = 1;
      const result = updateEntityId(Cart, oldId, 2);
      expect(result.payload.oldId).to.equal(oldId);
    });
    it('should include the newId of the entity in the payload', function () {
      const { Cart } = schemas;
      const newId = 2;
      const result = updateEntityId(Cart, 1, newId);
      expect(result.payload.newId).to.equal(newId);
    });
  });
  describe('deleteEntity(schema, id)', function () {
    it('should return an action object of type DELETE_ENTITY', function () {
      const { Cart } = schemas;
      const result = deleteEntity(Cart, 1231);
      expect(result.type).to.equal(DELETE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const { Cart } = schemas;
      const result = deleteEntity(Cart, 1231);
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the name of the entity in the payload', function () {
      const { Cart } = schemas;
      const result = deleteEntity(Cart, 1);
      expect(result.payload.name).to.equal('Cart');
    });
    it('should include the id of the entity in the payload', function () {
      const { Cart } = schemas;
      const id = 1231;
      const result = deleteEntity(Cart, id);
      expect(result.payload.id).to.equal(id);
    });
  });
});
