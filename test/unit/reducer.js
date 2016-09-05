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
        _schemas: schemas,
        Group: {},
        User: {},
        Task: {},
      };
      const result = reducer(undefined, {});
      expect(result).to.deep.equal(expected);
    });
    describe.skip('when `LOAD_ENTITY` is received as action', function () {
      it('should merge all the entities into the state', function () {
      });
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
        expect(finalState.Group[group.id].name).to.equal(group.name);
        expect(finalState.User[user.id].name).to.equal(user.name);
        expect(finalState.Task[task.id].name).to.equal(task.name);
      });
      it('should update relationships', function () {
        console.log(finalState.Group[group.id]);
        expect(finalState.Group[group.id].users).to.deep.equal([user.id]);
        //expect(finalState.User[user.id].tasks).to.deep.equal([tasks.id]);
      });
    });
    describe.skip('when `UPDATE_ENTITY` is received as action', function () {
      it('should update an entity when `UPDATE_ENTITY`', function () {
      });
      it.skip('should update relationships when `UPDATE_ENTITY`', function () {
      });
    });
    describe.skip('when `UPDATE_ENTITY_ID` is received as action', function () {
      it('should update the id of an entity when `UPDATE_ENTITY_ID`', function () {
      });
      it('should update relationships when `UPDATE_ENTITY_ID`', function () {
      });
    });
    describe.skip('when `DELETE_ENTITY` is received as action', function () {
      it('should delete an entity when `DELETE_ENTITY`', function () {
      });
      it('should update relationships when `DELETE_ENTITY`', function () {
      });
    });
  });
});
