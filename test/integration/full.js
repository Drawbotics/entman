import { expect } from 'chai';

import {
  defineSchema,
  hasMany,
  generateSchemas,
  reducer as entities,
  createEntity,
  createEntities,
  updateEntity,
  updateEntities,
  updateEntityId,
  deleteEntity,
} from 'index';
import api from './mock-api';


const Group = defineSchema('Group', {
  attributes: {
    users: hasMany('User'),
  },
});


const User = defineSchema('User', {
  attributes: {
    group: 'Group',
    tasks: hasMany('Task'),
  },
});


const Task = defineSchema('Task', {
  // user: 'User'  // Leave it out to test asymmetric relations
});


const schemas = generateSchemas([ Group, User, Task ]);


const reducer = entities(schemas);


// {{-- ACTIONS
const receiveGroups = (groups) => createEntities(schemas.Group, 'payload.groups', {
  type: 'RECEIVE_GROUPS',
  payload: { groups },
});

const createGroup = (group) => createEntities(schemas.Group, 'payload.group', {
  type: 'CREATE_GROUP',
  payload: { group },
});

const createUser = (user) => createEntities(schemas.User, 'payload.user', {
  type: 'CREATE_USER',
  payload: { user },
});

const createTask = (task) => createEntities(schemas.Task, 'payload.task', {
  type: 'CREATE_TASK',
  payload: { task },
});

const updateGroup = (id, data) => updateEntity(schemas.Group, id, 'payload.data', {
  type: 'UPDATE_GROUP',
  payload: { data },
});

const updateUser = (id, data) => updateEntity(schemas.User, id, 'payload.data', {
  type: 'UPDATE_USER',
  payload: { data },
});

const updateTask = (id, data) => updateEntity(schemas.Task, id, 'payload.data', {
  type: 'UPDATE_TASK',
  payload: { data },
});
// ACTIONS --}}


describe('FULL EXAMPLE', function () {

  describe('after initialization', function () {
    it('the reducer should return an empty state with empty entities', function () {
      const initialState = reducer(undefined, {});
      expect(initialState).to.contain.keys(['Group', 'User', 'Task']);
      expect(initialState.Group).to.be.empty;
      expect(initialState.User).to.be.empty;
      expect(initialState.Task).to.be.empty;
    });
  });

  describe('when adding groups to the estate', function () {
    it('the reducer should return the new state with the entities on it', function () {
      const initialState = reducer(undefined, {});
      const groups = api.groups.findAll();
      const action = receiveGroups(groups);
      const finalState = reducer(initialState, action);
    });
  });

  describe('when adding a new user', function () {
  });

});
