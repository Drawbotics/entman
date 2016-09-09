import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import {
  createEntity,
  updateEntity,
  updateEntityId,
  deleteEntity,
} from 'actions';
import {
  defineSchema,
  generateSchemas,
  hasMany,
} from 'schema';
import entities from 'reducer';


describe('@Reducer', function () {
  let schemas;
  before(function () {
    const group = defineSchema('Group', {
      users: hasMany('User'),
    });
    const user = defineSchema('User', {
      group: 'Group',
      tasks: hasMany('Task'),
    });
    const task = defineSchema('Task', {
      user: 'User',
      //TODO: users: hasMany('User'),
    });
    schemas = generateSchemas([group, user, task]);
  });
  describe('entities(schemas)', function () {
    it('should throw an error when `schemas` is empty', function () {
      expect(() => entities()).to.throw('INVALID SCHEMAS');
    });
    it('should return a reducer function', function () {
      const result = entities(schemas);
      expect(result).to.be.a('function');
    });
  });
  describe('reducer(state, action)', function () {
    let reducer;
    before(function () {
      reducer = entities(schemas);
    });
    it('should return the initialState when received undefined as `state`', function() {
      const expected = {
        Group: {},
        User: {},
        Task: {},
      };
      const result = reducer(undefined, {});
      expect(result).to.deep.equal(expected);
    });
    describe('when `CREATE_ENTITY` is received as action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      before(function () {
        const initialState = deepFreeze(reducer(undefined, {}));
        const createGroup = createEntity(schemas.Group, group);
        const createUser = createEntity(schemas.User, user);
        const createTask = createEntity(schemas.Task, task);
        finalState = deepFreeze(reducer(initialState, createGroup));
        finalState = deepFreeze(reducer(finalState, createUser));
        finalState = deepFreeze(reducer(finalState, createTask));
      });
      it('should add the new entity to the state', function () {
        const expectedState = {
          Group: {
            1: { id: 1, name: 'Group 1' },
          },
          User: {
            1: { id: 1, name: 'Lars', group: 1 },
          },
          Task: {
            1: { id: 1, title: 'Do something', user: 1 },
          },
        };
        expect(finalState).to.deep.equal(expectedState);
      });
    });
    describe('when `UPDATE_ENTITY` is received as action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const group2 = { name: 'Group 2', id: 2 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      const newName = 'Grishan';
      const newGroup = 2;
      before(function () {
        const initialState = deepFreeze(reducer(undefined, {}));
        const createGroup = createEntity(schemas.Group, group);
        const createGroup2 = createEntity(schemas.Group, group2);
        const createUser = createEntity(schemas.User, user);
        const createTask = createEntity(schemas.Task, task);
        const updateUser = updateEntity(schemas.User, 1, { name: newName, group: newGroup });
        finalState = deepFreeze(reducer(initialState, createGroup));
        finalState = deepFreeze(reducer(finalState, createGroup2));
        finalState = deepFreeze(reducer(finalState, createUser));
        finalState = deepFreeze(reducer(finalState, createTask));
        finalState = deepFreeze(reducer(finalState, updateUser));
      });
      it('should update the entity', function () {
        const expectedState = {
          Group: {
            1: { id: 1, name: 'Group 1' },
            2: { id: 2, name: 'Group 2' },
          },
          User: {
            1: { id: 1, name: newName, group: 2 },
          },
          Task: {
            1: { id: 1, title: 'Do something', user: 1 },
          },
        };
        expect(finalState).to.deep.equal(expectedState);
      });
    });
    describe('when `UPDATE_ENTITY_ID` is received as action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const group2 = { name: 'Group 2', id: 2 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      before(function () {
        const initialState = deepFreeze(reducer(undefined, {}));
        const createGroup = createEntity(schemas.Group, group);
        const createGroup2 = createEntity(schemas.Group, group2);
        const createUser = createEntity(schemas.User, user);
        const createTask = createEntity(schemas.Task, task);
        const updateUserId = updateEntityId(schemas.User, 1, 2);
        finalState = deepFreeze(reducer(initialState, createGroup));
        finalState = deepFreeze(reducer(finalState, createGroup2));
        finalState = deepFreeze(reducer(finalState, createUser));
        finalState = deepFreeze(reducer(finalState, createTask));
        finalState = deepFreeze(reducer(finalState, updateUserId));
      });
      it('should update the id of the entity', function () {
        const expectedState = {
          Group: {
            1: { id: 1, name: 'Group 1' },
            2: { id: 2, name: 'Group 2' },
          },
          User: {
            2: { id: 2, name: 'Lars', group: 1 },
          },
          Task: {
            1: { id: 1, title: 'Do something', user: 2 },
          },
        };
        expect(finalState).to.deep.equal(expectedState);
      });
      it('should return the state unmodified if `newId === oldId`', function () {
        const updateUserId = updateEntityId(schemas.User, 2, 2);
        finalState = deepFreeze(reducer(finalState, updateUserId));
        const expectedState = {
          Group: {
            1: { id: 1, name: 'Group 1' },
            2: { id: 2, name: 'Group 2' },
          },
          User: {
            2: { id: 2, name: 'Lars', group: 1 },
          },
          Task: {
            1: { id: 1, title: 'Do something', user: 2 },
          },
        };
        expect(finalState).to.deep.equal(expectedState);
      });
    });
    describe('when `DELETE_ENTITY` is received as action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      beforeEach(function () {
        const initialState = deepFreeze(reducer(undefined, {}));
        const createGroup = createEntity(schemas.Group, group);
        const createUser = createEntity(schemas.User, user);
        const createTask = createEntity(schemas.Task, task);
        const deleteTask = deleteEntity(schemas.Task, task);
        finalState = deepFreeze(reducer(initialState, createGroup));
        finalState = deepFreeze(reducer(finalState, createUser));
        finalState = deepFreeze(reducer(finalState, createTask));
        finalState = deepFreeze(reducer(finalState, deleteTask));
      });
      it('should delete the entity', function () {
        const expectedState = {
          Group: {
            1: { id: 1, name: 'Group 1' },
          },
          User: {
            1: { id: 1, name: 'Lars', group: 1 },
          },
          Task: {},
        };
        expect(finalState).to.deep.equal(expectedState);
      });
    });
  });
});
