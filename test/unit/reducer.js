import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

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
      attributes: {
        users: hasMany('User'),
      }
    });
    const user = defineSchema('User', {
      attributes: {
        group: 'Group',
        tasks: hasMany('Task'),
      }
    });
    const task = defineSchema('Task', {
      attributes: {
        users: hasMany('User'),
      }
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
    describe('when `CREATE_ENTITY_{ENTITY_NAME}` is received as an action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      before(function () {
        const initialState = deepFreeze(reducer(undefined, {}));
        const createGroup = {
          type: '@@entman/CREATE_ENTITY_GROUP',
          payload: {
            entity: group,
            key: 'Group',
          },
        };
        const createUser = {
          type: '@@entman/CREATE_ENTITY_USER',
          payload: {
            entity: user,
            key: 'User',
          },
        };
        const createTask = {
          type: '@@entman/CREATE_ENTITY_TASK',
          payload: {
            entity: task,
            key: 'Task',
          },
        };
        finalState = deepFreeze(reducer(initialState, createGroup));
        finalState = deepFreeze(reducer(finalState, createUser));
        finalState = deepFreeze(reducer(finalState, createTask));
      });
      it('should add the new entity to the state', function () {
        expect(finalState.Group[1]).to.exist;
        expect(finalState.User[1]).to.exist;
        expect(finalState.Task[1]).to.exist;
      });
    });
    describe('when `UPDATE_ENTITY_{ENTITY_NAME}` is received as an action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      const newName = 'Grishan';
      const newGroup = 2;
      before(function () {
        const initialState = deepFreeze({
          Group: {
            1: { id: 1, name: 'Group 1', users: [ 1 ] },
            2: { id: 2, name: 'Group 2', users: [ 2 ] },
          },
          User: {
            1: { id: 1, name: 'Lars', group: 1, tasks: [ 1 ] },
            2: { id: 2, name: 'Deathvoid', group: 2, tasks: [] },
          },
          Task: {
            1: { id: 1, name: 'Task 1', users: [ 1 ] },
          },
        });
        const updateGroup = {
          type: '@@entman/UPDATE_ENTITY_GROUP',
          payload: {
            entity: { id: 1, name: 'New Group 1' },
            oldEntity: initialState.Group[1],
            key: 'Group',
          },
        };
        const updateUser = {
          type: '@@entman/UPDATE_ENTITY_USER',
          payload: {
            entity: { id: 1, group: 2 },
            oldEntity: initialState.User[1],
            key: 'User',
          },
        };
        const updateTask = {
          type: '@@entman/UPDATE_ENTITY_TASK',
          payload: {
            entity: { id: 1, users: [ 1, 2 ] },
            oldEntity: initialState.Task[1],
            key: 'Task',
          },
        };
        finalState = deepFreeze(reducer(initialState, updateGroup));
        finalState = deepFreeze(reducer(finalState, updateUser));
        finalState = deepFreeze(reducer(finalState, updateTask));
      });
      it('should update single properties of the entity correctly', function () {
        expect(finalState.Group[1].name).to.equal('New Group 1');
      });
      it('should update oneToMany relations correctly', function () {
        expect(finalState.User[1].group).to.equal(2);
        expect(finalState.Group[2].users).to.include(1);
      });
      it('should update manyToMany relations correctly', function () {
        expect(finalState.User[2].tasks).to.include(1);
        expect(finalState.Task[1].users).to.include(2);
      });
    });
    describe.skip('when `UPDATE_ENTITY_ID` is received as action', function () {
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
    });
    describe('when `DELETE_ENTITY` is received as action', function () {
      let finalState;
      beforeEach(function () {
        const initialState = deepFreeze({
          Group: {
            1: { name: 'Group 1', id: 1, users: [ 1 ] },
            2: { name: 'Group 2', id: 2, users: [ 2 ] },
          },
          User: {
            1: { name: 'Lars', group: 1, id: 1, tasks: [ 1 ] },
            2: { name: 'Deathvoid', group: 2, id: 2, tasks: [ 2 ] },
          },
          Task: {
            1: { title: 'Do something', users: [ 1 ], id: 1 },
            2: { title: 'Do something again', users: [ 2 ], id: 2 },
          },
        });
        const deleteGroup = {
          type: '@@entman/DELETE_ENTITY_GROUP',
          payload: {
            entity: initialState.Group[2],
            key: 'Group',
          },
        };
        const deleteUser = {
          type: '@@entman/DELETE_ENTITY_USER',
          payload: {
            entity: initialState.User[1],
            key: 'User',
          },
        };
        const deleteTask = {
          type: '@@entman/DELETE_ENTITY_TASK',
          payload: {
            entity: initialState.Task[2],
            key: 'Task',
          },
        };
        finalState = deepFreeze(reducer(initialState, deleteGroup));
        finalState = deepFreeze(reducer(finalState, deleteUser));
        finalState = deepFreeze(reducer(finalState, deleteTask));
      });
      it('should delete the entity', function () {
        expect(finalState.Group[2]).to.not.exist;
        expect(finalState.User[1]).to.not.exist;
        expect(finalState.Task[2]).to.not.exist;
      });
      it('should update oneToMany relations', function () {
        expect(finalState.Group[1].users).to.not.contain(1);
        expect(finalState.User[2].group).to.be.null;
      });
      it('should update manyToMany relations', function () {
        expect(finalState.Task[1].users).to.not.include(1);
        expect(finalState.User[2].tasks).to.not.include(2);
      });
    });
  });
});
