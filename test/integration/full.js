import { expect } from 'chai';
import { createStore } from 'redux';
import { v4 } from 'node-uuid';

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

  const store = createStore(reducer);


  before(function () {
  });

  describe('after initialization', function () {
    it('the store should contain an state with empty entities', function () {
      const state = store.getState();
      expect(state).to.contain.keys(['Group', 'User', 'Task']);
      expect(state.Group).to.be.empty;
      expect(state.User).to.be.empty;
      expect(state.Task).to.be.empty;
    });
  });

  describe('when adding groups to the estate', function () {
    let state;
    before(function () {
      const groups = api.groups.findAll();
      const action = receiveGroups(groups);
      store.dispatch(action);
      state = store.getState();
    });
    it('the reducer should return the new state with the groups on it', function () {
      expect(state.Group[1]).to.exist;
      expect(state.Group[2]).to.exist;
    });
    it('the new state should contain also related entities', function () {
      expect(state.User[1]).to.exist;
      expect(state.User[2]).to.exist;
      expect(state.User[3]).to.exist;
      expect(state.User[4]).to.exist;
    });
  });

  describe('when adding a new user', function () {
    let state;
    before(function () {
      const newUser = {
        id: 123,
        name: 'Fienhard',
        group: 1,
      };
      const action = createUser(newUser);
      store.dispatch(action);
      state = store.getState();
    });
    it('the new state should contain the new user', function () {
      expect(state.User[123]).to.exist;
    });
    it('if the new user contained an embedded entity, the state should also contain it', function () {
    });
  });

});
