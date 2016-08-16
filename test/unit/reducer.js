import { expect } from 'chai';
import { Schema, arrayOf } from 'normalizr';
import deepFreeze from 'deep-freeze';

import entities from 'reducer';
import { inverseSchemas } from 'utils';
import {
  createEntity,
  updateEntity,
  updateEntityId,
  deleteEntity,
} from 'actions';


describe('@Reducer', function () {
  let reducer;
  let schemas;
  let schemasObj;
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
    schemas = [cart, estate, user];
    schemasObj = { cart, estate, user };
    reducer = entities(schemas);
  });
  it('should return a reducer', function () {
    expect(reducer).to.be.a('function');
  });
  it('should return the initialState when received undefined as `state`', function() {
    const inversedSchemas = inverseSchemas(schemas);
    const expected = {
      _originalSchemas: Object.values(schemas).reduce((result, s) => ({ ...result, [s._key]: s }), {}),
      _schemas: inversedSchemas,
      cart: {},
      estate: {},
      user: {},
    };
    const result = reducer(undefined, deepFreeze({}));
    expect(result).to.deep.equal(expected);
  });
  it('should merge entities into the state when `CREATE_ENTITY`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      cart: { 2: { id: 2, estates: [] }},
    });
    const data = {
      id: 1,
      estates: [{
        id: 1,
        cart: 1,
      }, {
        id: 2,
        cart: 1,
      }],
    };
    const action = createEntity(schemasObj.cart, data);
    const expected = {
      ...initialState,
      cart: {
        1: { id: 1, estates: [1, 2] },
        2: { id: 2, estates: [] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it('should update relationships when `CREATE_ENTITY`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      cart: {
        1: { id: 1, estates: [1, 2] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
      }
    });
    const data = {
      id: 3,
      cart: 1,
    };
    const action = createEntity(schemasObj.estate, data);
    const expected = {
      ...initialState,
      cart: {
        1: { id: 1, estates: [1, 2, 3] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
        3: { id: 3, cart: 1 },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it('should update an entity when `UPDATE_ENTITY`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      user: {
        1: { id: 1, name: 'Lars', carts: [] },
      },
    });
    const data = {
      name: 'Stan'
    };
    const action = updateEntity(schemasObj.user, 1, data);
    const expected = {
      ...initialState,
      user: {
        1: { id: 1, name: 'Stan', carts: [] },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it.skip('should update relationships when `UPDATE_ENTITY`', function () {
  });
  it('should update the id of an entity when `UPDATE_ENTITY_ID`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      user: {
        12: { id: 12, name: 'Lars', carts: [] },
      },
    });
    const action = updateEntityId(schemasObj.user, 12, 1);
    const expected = {
      ...initialState,
      user: {
        1: { id: 1, name: 'Lars', carts: [] },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it('should update relationships when `UPDATE_ENTITY_ID`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      cart: {
        1: { id: 1, estates: [1, 2] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
      }
    });
    const action = updateEntityId(schemasObj.estate, 1, 3);
    const expected = {
      ...initialState,
      cart: {
        1: { id: 1, estates: [2, 3] },
      },
      estate: {
        3: { id: 3, cart: 1 },
        2: { id: 2, cart: 1 },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it('should delete an entity when `DELETE_ENTITY`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      user: {
        1: { id: 1, carts: [] },
      },
    });
    const action = deleteEntity(schemasObj.user, 1);
    const expected = {
      ...initialState,
      user: {},
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  });
  it('should update relationships when `DELETE_ENTITY`', function () {
    const schemas = inverseSchemas(schemas);
    const initialState = deepFreeze({
      ...reducer(undefined, {}),
      cart: {
        1: { id: 1, estates: [1, 2, 3] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
        3: { id: 3, cart: 1 },
      }
    });
    const action = deleteEntity(schemasObj.estate, 3);
    const expected = {
      ...initialState,
      cart: {
        1: { id: 1, estates: [1, 2] },
      },
      estate: {
        1: { id: 1, cart: 1 },
        2: { id: 2, cart: 1 },
      },
    };
    const result = reducer(initialState, action);
    expect(result).to.deep.equal(expected);
  })
});
