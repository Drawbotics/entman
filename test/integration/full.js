import { expect } from 'chai';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { v4 } from 'node-uuid';
import reduxThunk from 'redux-thunk';

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
  deleteEntities,
  getEntitiesSlice,
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


const reducer = combineReducers({ entities: entities(schemas) });


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

const updateGroup = (id, data) => updateEntities(schemas.Group, id, 'payload.data', {
  type: 'UPDATE_GROUP',
  payload: { data },
});

const updateUser = (id, data) => updateEntities(schemas.User, id, 'payload.data', {
  type: 'UPDATE_USER',
  payload: { data },
});

const updateTask = (id, data) => updateEntities(schemas.Task, id, 'payload.data', {
  type: 'UPDATE_TASK',
  payload: { data },
});

const deleteGroup = (id) => deleteEntities(schemas.Group, id, {
  type: 'DELETE_GROUP',
});

const deleteUser = (id) => deleteEntities(schemas.User, id, {
  type: 'DELETE_USER',
});
// ACTIONS --}}


describe('FULL EXAMPLE', function () {

  const store = createStore(
    reducer,
    compose(
      applyMiddleware(reduxThunk),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
  );


  before(function () {
  });

  describe('after initialization', function () {
    it('the store should contain an state with empty entities', function () {
      const state = getEntitiesSlice(store.getState());
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
      state = getEntitiesSlice(store.getState());
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
        group: 1,  // should we dispatch two actions? createUser() and addUserToGroup()?
      };
      const action = createUser(newUser);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the new state should contain the new user', function () {
      expect(state.User[123]).to.exist;
    });
    it('the group should be updated with the new user', function () {
      expect(state.Group[1].users).to.include('123');
    });
    it.skip('if the new user contained an embedded entity, what should we do?', function () {
    });
  });

  describe('when updating a group', function () {
    let state;
    describe('if we\'re updating a single property (no array, no relation)', function () {
      before(function () {
        const action = updateGroup(1, { name: 'New Test Group' });
        store.dispatch(action);
        state = getEntitiesSlice(store.getState());
      });
      it('the property of the group should be updated in the state', function () {
        expect(state.Group[1].name).to.equal('New Test Group');
      });
    })
  });

  describe('when updating an user', function () {
    let state;
    before(function () {
      const action = updateUser(1, { name: 'New User Name', group: 2 });
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the entity should have its properties updated', function () {
      expect(state.User[1].name).to.equal('New User Name');
    });
  });

  describe('when deleting an user', function () {
    let state;
    before(function () {
      const action = deleteUser(123);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the entity should be removed from the state', function () {
      expect(state.User[123]).to.not.exist;
    });
    it('the related group should be updated to remove the reference to the user', function () {
      expect(state.Group[1].users).to.not.include('123');
    })
  });

  describe('when deleting a group', function () {
    let state;
    before(function () {
      const action = deleteGroup(1);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the entity should be removed from the state', function () {
    });
    it.skip('do we cascade related entities as well?', function () {
    });
  });

});
