import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { Schema, arrayOf } from 'normalizr';

import entities from 'reducer';
import { inverseSchemas } from 'utils';
import {
  getEntities,
  getEntitiesBy,
  getEntity,
} from 'selectors';


describe('@Selectors', function () {
  let state;
  let reducer;
  before(function () {
    const cart = new Schema('cart');
    const estate = new Schema('estate');
    const user = new Schema('user');
    user.define({
      carts: arrayOf(cart),
    });
    cart.define({
      user,
      estates: arrayOf(estate),
    });
    estate.define({
      cart,
    });
    reducer = entities([cart, estate, user]);
    state = deepFreeze({
      ...reducer(undefined, {}),
      user: {
        1: { id: 1, name: 'Lars', carts: [] },
        2: { id: 2, name: 'Stan', carts: [] },
      },
      cart: {
        1: { id: 1, estates: [1, 2] },
        2: { id: 2, estates: [3] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
        3: { id: 3, cart: 2 },
      },
    });
  });
  describe('getEntities(state, name)', function () {
    it('should return all the entities of name = `name`', function () {
      const result = getEntities(state, 'user');
      const expected = [
        { id: 1, name: 'Lars', carts: [] },
        { id: 2, name: 'Stan', carts: [] },
      ];
      expect(result).to.deep.equal(expected);
    });
    it('should populate relationships one level deep', function () {
      const result = getEntities(state, 'cart');
      const expected = [
        { id: 1 },
        { id: 2 },
      ];
      expected[0].estates = [{
        id: 1, cart: expected[0],
      }, {
        id: 2, cart: expected[0],
      }];
      expected[1].estates = [{
        id: 3, cart: expected[1],
      }];
      const cart1 = result[0];
      const cart2 = result[1];
      const expectedCart1 = expected[0];
      const expectedCart2 = expected[1];
      // Entities
      expect(result).to.have.lengthOf(2);
      expect(cart1.id).to.equal(expectedCart1.id);
      expect(cart2.id).to.equal(expectedCart2.id);
      // Relationships
      expect(cart1.estates).to.have.lengthOf(2);
      expect(cart2.estates).to.have.lengthOf(1);
      expect(cart1.estates[0].id).to.equal(expectedCart1.estates[0].id);
      expect(cart1.estates[1].id).to.equal(expectedCart1.estates[1].id);
      expect(cart2.estates[0].id).to.equal(expectedCart2.estates[0].id);
    });
    it('should populate all relationships', function () {
      const state = deepFreeze({
        ...reducer(undefined, {}),
        user: {
          1: { id: 1, name: 'Lars', carts: [1] },
        },
        cart: {
          1: { id: 1, estates: [1] },
        },
        estate: {
          1: { id: 1, cart: 1 },
        },
      });
      const result = getEntities(state, 'user');
      const expected = [
        { id: 1 },
      ];
      expected[0].carts = [{
        id: 1, user: expected[0],
      }];
      expected[0].carts[0].estates = [{
        id: 1, cart: expected[0].carts[0],
      }];
      const user = result[0];
      const expectedUser = expected[0];
      // Entities
      expect(result).to.have.lengthOf(1);
      expect(user.id).to.equal(expectedUser.id);
      // Relationships
      expect(user.carts).to.have.lengthOf(1);
      expect(user.carts[0].id).to.equal(expectedUser.carts[0].id);
      expect(user.carts[0].estates[0].id).to.equal(expectedUser.carts[0].estates[0].id);
    });
  });
  describe('getEntitiesBy(state, name, by={})', function () {
    it('should return all the entities of name = `name` that fulfil the condition `by`', function () {
      const result = getEntitiesBy(state, 'user', { name: 'Lars' });
      const expected = [
        { id: 1, name: 'Lars', carts: [] },
      ];
      expect(result).to.deep.equal(expected);
    });
    it('should return an empty array when no entity fulfil the condition `by`', function () {
      const result = getEntitiesBy(state, 'user', { name: 'Sandjiv' });
      const expected = [];
      expect(result).to.deep.equal(expected);
    });
    it('should populate relationships one level deep', function () {
      const result = getEntitiesBy(state, 'cart', { id: 1 });
      const expected = [
        { id: 1 },
      ];
      expected[0].estates = [{
        id: 1, cart: expected[0],
      }, {
        id: 2, cart: expected[0],
      }];
      const cart1 = result[0];
      const expectedCart1 = expected[0];
      // Entities
      expect(result).to.have.lengthOf(1);
      expect(cart1.id).to.equal(expectedCart1.id);
      // Relationships
      expect(cart1.estates).to.have.lengthOf(2);
      expect(cart1.estates[0].id).to.equal(expectedCart1.estates[0].id);
      expect(cart1.estates[1].id).to.equal(expectedCart1.estates[1].id);
    });
    it('should populate all relationships', function () {
      const state = deepFreeze({
        ...reducer(undefined, {}),
        user: {
          1: { id: 1, name: 'Lars', carts: [1] },
        },
        cart: {
          1: { id: 1, estates: [1] },
        },
        estate: {
          1: { id: 1, cart: 1 },
        },
      });
      const result = getEntitiesBy(state, 'user', { id: 1 });
      const expected = [
        { id: 1 },
      ];
      expected[0].carts = [{
        id: 1, user: expected[0],
      }];
      expected[0].carts[0].estates = [{
        id: 1, cart: expected[0].carts[0],
      }];
      const user = result[0];
      const expectedUser = expected[0];
      // Entities
      expect(result).to.have.lengthOf(1);
      expect(user.id).to.equal(expectedUser.id);
      // Relationships
      expect(user.carts).to.have.lengthOf(1);
      expect(user.carts[0].id).to.equal(expectedUser.carts[0].id);
      expect(user.carts[0].estates[0].id).to.equal(expectedUser.carts[0].estates[0].id);
    });
  });
  describe('getEntity(state, name, id)', function () {
    it('should return the entity of name = `name` with the specified `id`', function () {
      const result = getEntity(state, 'user', 1);
      const expected = { id: 1, name: 'Lars', carts: [] };
      expect(result).to.deep.equal(expected);
    });
    it('should populate relationships one level deep', function () {
      const result = getEntity(state, 'cart', 1);
      const expected = { id: 1 };
      expected.estates = [{
        id: 1, cart: expected,
      }, {
        id: 2, cart: expected,
      }];
      // Entities
      expect(result.id).to.equal(expected.id);
      // Relationships
      expect(result.estates).to.have.lengthOf(2);
      expect(result.estates[0].id).to.equal(expected.estates[0].id);
      expect(result.estates[1].id).to.equal(expected.estates[1].id);
    });
    it('should populate all relationships', function () {
      const state = deepFreeze({
        ...reducer(undefined, {}),
        user: {
          1: { id: 1, name: 'Lars', carts: [1] },
        },
        cart: {
          1: { id: 1, estates: [1], user: 1 },
        },
        estate: {
          1: { id: 1, cart: 1 },
        },
      });
      const user = getEntity(state, 'user', 1);
      const expectedUser = { id: 1 };
      expectedUser.carts = [{
        id: 1, user: expectedUser,
      }];
      expectedUser.carts[0].estates = [{
        id: 1, cart: expectedUser.carts[0],
      }];
      // Entities
      expect(user.id).to.equal(expectedUser.id);
      // Relationships
      expect(user.carts).to.have.lengthOf(1);
      expect(user.carts[0].id).to.equal(expectedUser.carts[0].id);
      expect(user.carts[0].estates[0].id).to.equal(expectedUser.carts[0].estates[0].id);
      // Bidirectional relationships
      expect(user.carts[0].user.id).to.equal(user.id);
    });
    it('should throw an error if no `id` is specified', function () {
      const result = () => getEntity(state, 'cart');
      expect(result).to.throw(Error);
    });
  });
});
