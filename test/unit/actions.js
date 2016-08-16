import { expect } from 'chai';
import { normalize, Schema, arrayOf } from 'normalizr';

import {
  createEntity,
  CREATE_ENTITY,
  updateEntity,
  UPDATE_ENTITY,
  deleteEntity,
  DELETE_ENTITY,
} from 'actions';


describe('@Actions', function () {
  let schemas;
  before(function () {
    const cart = new Schema('cart');
    const estate = new Schema('estate');
    const user = new Schema('user');
    cart.define({
      estates: arrayOf(estate),
      user: user,
    });
    estate.define({
      cart: cart,
    });
    user.define({
      carts: arrayOf(cart),
    });
    schemas = { cart, estate, user };
  });
  describe('createEntity(name, data)', function () {
    it('should return an action object of type CREATE_ENTITY', function () {
      const result = createEntity(schemas.cart, {});
      expect(result.type).to.equal(CREATE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const result = createEntity(schemas.cart, {});
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the name of the entity and the data in the payload', function () {
      const name = 'cart';
      const data = { foo: 'bar' };
      const result = createEntity(schemas.cart, data);
      expect(result.payload.name).to.equal(name);
      expect(result.payload.data).to.deep.equal(normalize(data, schemas.cart));
    });
  });
  describe('updateEntity(name, id, data)', function () {
    it('should return an action object of type UPDATE_ENTITY', function () {
      const result = updateEntity(schemas.cart, 1231, { foo: 'bar' });
      expect(result.type).to.equal(UPDATE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const result = updateEntity(schemas.cart, 1231, {});
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the id of the entity, the name of the entity and the data in the payload', function () {
      const id = 1231;
      const name = 'cart';
      const data = { foo: 'bar' };
      const result = updateEntity(schemas.cart, id, data);
      expect(result.payload.name).to.equal(name);
      expect(result.payload.id).to.equal(id);
      expect(result.payload.data).to.deep.equal(normalize({ id, ...data }, schemas.cart));
    });
  });
  describe('deleteEntity(name, id)', function () {
    it('should return an action object of type DELETE_ENTITY', function () {
      const result = deleteEntity(schemas.cart, 1231);
      expect(result.type).to.equal(DELETE_ENTITY);
    });
    it('should include a meta property with isEntityAction set to true', function () {
      const result = deleteEntity(schemas.cart, 1231);
      expect(result.meta.isEntityAction).to.be.true;
    });
    it('should include the name of the entity and the id of the entity in the payload', function () {
      const id = 1231;
      const name = 'cart';
      const result = deleteEntity(schemas.cart, id);
      expect(result.payload.name).to.equal(name);
      expect(result.payload.id).to.equal(id);
    });
  });
});
