import deepFreeze from 'deep-freeze';

import {
  defineSchema,
  generateSchemas,
  hasMany,
} from 'schema';
import entities from 'reducer';


describe('@Reducer', function () {
  let schemas;
  beforeAll(function () {
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
  describe('entities(schemas, initialState)', function () {
    it('should throw an error when `schemas` is empty', function () {
      expect(() => entities()).toThrow('INVALID SCHEMAS');
    });
    it('should return a reducer function', function () {
      const result = entities(schemas);
      expect(typeof result).toBe('function');
    });
  });
  describe('reducer(state, action)', function () {
    let reducer;
    beforeAll(function () {
      reducer = entities(schemas);
    });
    it('should return the initialState when received undefined as `state`', function() {
      const expected = {
        Group: {},
        User: {},
        Task: {},
      };
      const result = reducer(undefined, {});
      expect(result).toEqual(expected);
    });
    it('should return the passed initialState when specified', function () {
      const expected = {
        Group: { 1: { id: 1 } },
        User: {},
        Task: {},
      };
      const reducer = entities(schemas, {
        Group: { 1: { id: 1 } }
      });
      const result = reducer(undefined, {});
      expect(result).toEqual(expected);
    });
    describe('when `CREATE_ENTITY_{ENTITY_NAME}` is received as an action', function () {
      let finalState;
      const group = { name: 'Group 1', id: 1 };
      const user = { name: 'Lars', group: 1, id: 1 };
      const task = { title: 'Do something', user: 1, id: 1 };
      beforeAll(function () {
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
        expect(finalState.Group[1]).toBeDefined();
        expect(finalState.User[1]).toBeDefined();
        expect(finalState.Task[1]).toBeDefined();
      });
    });
    describe('when `UPDATE_ENTITY_{ENTITY_NAME}` is received as an action', function () {
      let finalState;
      beforeAll(function () {
        const initialState = deepFreeze({
          Group: {
            1: { id: 1, name: 'Group 1', users: [ 1 ] },
            2: { id: 2, name: 'Group 2', users: [ 2 ] },
          },
          User: {
            1: { id: 1, name: 'Lars', group: 1, tasks: [ 1 ] },
            2: { id: 2, name: 'Deathvoid', group: 2, tasks: [] },
            3: { id: 2, name: 'Grishan', username: undefined, group: null, tasks: [] },
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
        const updateGroup2 = {
          type: '@@entman/UPDATE_ENTITY_GROUP',
          payload: {
            entity: { id: 2, name: undefined },
            oldEntity: initialState.Group[2],
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
        finalState = deepFreeze(reducer(finalState, updateGroup2));
        finalState = deepFreeze(reducer(finalState, updateUser));
        finalState = deepFreeze(reducer(finalState, updateTask));
      });
      it('should update single properties of the entity correctly', function () {
        expect(finalState.Group[1].name).toBe('New Group 1');
      });
      it('should not modify properties with a value of undefined', function () {
        expect(finalState.Group[2].name).toBe('Group 2');
      });
      it('should update oneToMany relations correctly', function () {
        expect(finalState.User[1].group).toBe(2);
        expect(finalState.Group[2].users).toContain(1);
      });
      it('should update manyToMany relations correctly', function () {
        expect(finalState.User[2].tasks).toContain(1);
        expect(finalState.Task[1].users).toContain(2);
      });
      describe('if `defaultTo` in the payload is set to true', function () {
        beforeAll(function () {
          const updateUser3 = {
            type: '@@entman/UPDATE_ENTITY_USER',
            payload: {
              entity: { id: 3, name: 'Grishan2', username: 'grishan' },
              oldEntity: finalState.User[3],
              key: 'User',
              useDefault: true,
            },
          };
          finalState = deepFreeze(reducer(finalState, updateUser3));
        });
        it('should only update undefined properties and not override existing values', function () {
          expect(finalState.User[3].name).toBe('Grishan');
          expect(finalState.User[3].username).toBe('grishan');
        });
      });
    });
    describe('when `UPDATE_ENTITY_ID` is received as action', function () {
      let finalState;
      beforeAll(function () {
        const initialState = deepFreeze({
          Group: {
            1: { id: 1, name: 'Group 1', users: [ 1 ] },
            2: { id: 2, name: 'Group 2', users: [ 2, 3 ] },
          },
          User: {
            1: { id: 1, name: 'Lars', group: 1, tasks: [ 1 ] },
            2: { id: 2, name: 'Deathvoid', group: 2, tasks: [] },
            3: { id: 2, name: 'Grishan', group: 2 },
          },
          Task: {
            1: { id: 1, name: 'Task 1', users: [ 1 ] },
          },
        });
        const updateGroupId = {
          type: '@@entman/UPDATE_ENTITY_ID_GROUP',
          payload: {
            oldId: 1,
            newId: 123,
            oldEntity: initialState.Group[1],
            key: 'Group',
          },
        };
        const updateUserId = {
          type: '@@entman/UPDATE_ENTITY_ID_USER',
          payload: {
            oldId: 1,
            newId: 123,
            oldEntity: initialState.User[1],
            key: 'User',
          },
        };
        const updateTaskId = {
          type: '@@entman/UPDATE_ENTITY_ID_TASK',
          payload: {
            oldId: 1,
            newId: 123,
            oldEntity: initialState.Task[1],
            key: 'Task',
          },
        };
        finalState = deepFreeze(reducer(initialState, updateGroupId));
        finalState = deepFreeze(reducer(finalState, updateUserId));
        finalState = deepFreeze(reducer(finalState, updateTaskId));
      });
      it('should update the id of the entity', function () {
        expect(finalState.Group[1]).toBeUndefined();
        expect(finalState.Group[123]).toBeDefined();
        expect(finalState.User[1]).toBeUndefined();
        expect(finalState.User[123]).toBeDefined();
        expect(finalState.Task[1]).toBeUndefined();
        expect(finalState.Task[123]).toBeDefined();
      });
      it('should update oneToMany relations', function () {
        expect(finalState.User[123].group).toBe(123);
        expect(finalState.Group[123].users).toContain(123);
      });
      it('should update manyToMany relations', function () {
        expect(finalState.User[123].tasks).toContain(123);
        expect(finalState.Task[123].users).toContain(123);
      });
      it('if the attribute specified by the schema is not found on the entity, create it', function () {
        expect(finalState.User[3].tasks).toBeDefined();
        expect(finalState.User[3].tasks).toBeInstanceOf(Array);
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
        expect(finalState.Group[2]).toBeUndefined();
        expect(finalState.User[1]).toBeUndefined();
        expect(finalState.Task[2]).toBeUndefined();
      });
      it('should update oneToMany relations', function () {
        expect(finalState.Group[1].users).not.toContain(1);
        expect(finalState.User[2].group).toBeNull();
      });
      it('should update manyToMany relations', function () {
        expect(finalState.Task[1].users).not.toContain(1);
        expect(finalState.User[2].tasks).not.toContain(2);
      });
    });
  });
});
