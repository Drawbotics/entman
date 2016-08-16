import { expect } from 'chai';
import isEqual from 'lodash/isEqual';
import { Schema, arrayOf } from 'normalizr';

import {
  inverseSchema,
  inverseSchemas,
  getEmptyEntities,
} from 'utils';


describe('@Utils', function () {
  let cart;
  let estate;
  let user;
  before(function () {
    cart = new Schema('cart');
    estate = new Schema('estate');
    user = new Schema('user');
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
  });
  describe('inverseSchema(schema)', function () {
    it('should inverse the schema correctly', function () {
      const expected = {
        name: 'cart',
        relationships: {
          estate: { key: 'estates', isArray: true, entity: 'estate' },
          user: { key: 'user', isArray: false, entity: 'user' },
        },
      };
      const result = inverseSchema(cart);
      expect(result).to.deep.equal(expected);
    });
  });
  describe('inverseSchemas(schemas)', function () {
    it('should inverse all the schemas correctly', function () {
      const schemas = [cart, estate, user];
      const expected = {
        cart: {
          name: 'cart',
          relationships: {
            estate: { key: 'estates', isArray: true, entity: 'estate' },
            user: { key: 'user', isArray: false, entity: 'user' },
          },
        },
        estate: {
          name: 'estate',
          relationships: {
            cart: { key: 'cart', isArray: false, entity: 'cart' },
          },
        },
        user: {
          name: 'user',
          relationships: {
            cart: { key: 'carts', isArray: true, entity: 'cart' },
          },
        },
      };
      const result = inverseSchemas(schemas);
      expect(result).to.deep.equal(expected);
    });
  });
  describe('getEmptyEntities(inversedSchemas)', function () {
    it('should return an object with the schema names as keys and an empty object as values', function () {
      const schemas = [cart, estate, user];
      const inversedSchemas = inverseSchemas(schemas);
      const expected = {
        cart: {},
        estate: {},
        user: {},
      };
      const result = getEmptyEntities(inversedSchemas);
      expect(result).to.deep.equal(expected);
    });
  });
});
