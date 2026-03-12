import {
  getEntitiesSlice,
} from '../../src';

import api from './mock-api';
import {
  receiveGroups,
  createUser,
  updateGroup,
  updateUser,
  deleteGroup,
  deleteUser,
  updateUserId,
  updateGroupId,
} from './actions-test';
import store from './store-test';


describe('FULL EXAMPLE', function () {

  describe('after initialization', function () {
    it('the store should contain an state with empty entities', function () {
      const state = getEntitiesSlice(store.getState());
      expect(state).toHaveProperty('Group');
      expect(state).toHaveProperty('User');
      expect(state).toHaveProperty('Task');
      expect(state.Group).toEqual({});
      expect(state.User).toEqual({});
      expect(state.Task).toEqual({});
    });
  });

  describe('when adding groups to the estate', function () {
    let state;
    beforeAll(function () {
      const groups = api.groups.findAll();
      const action = receiveGroups(groups);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the reducer should return the new state with the groups on it', function () {
      expect(state.Group[1]).toBeDefined();
      expect(state.Group[2]).toBeDefined();
    });
    it('the new state should contain also related entities', function () {
      expect(state.User[1]).toBeDefined();
      expect(state.User[2]).toBeDefined();
      expect(state.User[3]).toBeDefined();
      expect(state.User[4]).toBeDefined();
    });
  });

  describe('when adding a new user', function () {
    let state;
    beforeAll(function () {
      const newUser = {
        id: 123,
        name: 'Fienhard',
        group: 1,
        tasks: [
          {
            id: 6,
            name: 'Task 6',
            users: [ 123 ],
          },
          {
            id: 5,
            name: 'Task 52',
            users: [ 123, 4 ],
          },
        ],
      };
      const action = createUser(newUser);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the new state should contain the new user', function () {
      expect(state.User[123]).toBeDefined();
    });
    it('the group should be updated with the new user', function () {
      expect(state.Group[1].users).toContain(123);
    });
    describe('if the new user contained an embedded entity', function () {
      it('add it to the store if it wasn\'t already there', function () {
        expect(state.Task[6]).toBeDefined();
      });
      it('update the entity in the store if it was already there', function () {
        expect(state.Task[5].name).toBe('Task 52');
      });
    });
  });

  describe('when updating a group', function () {
    let state;
    describe('if we\'re updating a single property (no array, no relation)', function () {
      beforeAll(function () {
        const action = updateGroup(1, { name: 'New Test Group' });
        store.dispatch(action);
        state = getEntitiesSlice(store.getState());
      });
      it('the property of the group should be updated in the state', function () {
        expect(state.Group[1].name).toBe('New Test Group');
      });
    });
  });

  describe('when updating an user', function () {
    let state;
    beforeAll(function () {
      const action = updateUser(1, { name: 'New User Name', group: 2 });
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the user should have its properties updated', function () {
      expect(state.User[1].name).toBe('New User Name');
    });
    describe('if updating the group of the user', function () {
      it('the original group should not contain the user in the users list', function () {
        expect(state.Group[1].users).not.toContain(1);
      });
      it('the new group should contain the user in the users list', function () {
        expect(state.Group[2].users).toContain(1);
      });
    });
  });

  describe('when updating the tasks of an user', function () {
    let state;
    beforeAll(function () {
      const action = updateUser(1, { tasks: [2, 3] });
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the user should have its tasks updated', function () {
      expect(state.User[1].tasks).not.toContain(1);
      expect(state.User[1].tasks).toContain(2);
      expect(state.User[1].tasks).toContain(3);
    });
    it('the tasks should have its respective users updated', function () {
      expect(state.Task[1].users).not.toContain(1);
      expect(state.Task[2].users).toContain(1);
      expect(state.Task[3].users).toContain(1);
    });
  });

  describe('when deleting an user', function () {
    let state;
    beforeAll(function () {
      const action = deleteUser(123);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the entity should be removed from the state', function () {
      expect(state.User[123]).toBeUndefined();
    });
    it('the related group should be updated to remove the reference to the user', function () {
      expect(state.Group[2].users).not.toContain('123');
    });
  });

  describe('when deleting a group', function () {
    let state;
    beforeAll(function () {
      const action = deleteGroup(1);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the entity should be removed from the state', function () {
      expect(state.Group[1]).toBeUndefined();
    });
    it('the associated entities should set the related property to null', function () {
      expect(state.User[2].group).toBeNull();
    });
    it.skip('or do we cascade related entities?', function () {
    });
  });

  describe('when updating the id of an user', function () {
    let state;
    beforeAll(function () {
      const action = updateUserId(1, 145);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the id of the user in the store should have changed', function () {
      expect(state.User[1]).toBeUndefined();
      expect(state.User[145]).toBeDefined();
    });
    it('the related group should also change the id in the users array', function () {
      expect(state.Group[2].users).not.toContain('1');
      expect(state.Group[2].users).toContain(145);
    });
  });

  describe('when updating the id of a group', function () {
    let state;
    beforeAll(function () {
      const action = updateGroupId(2, 456);
      store.dispatch(action);
      state = getEntitiesSlice(store.getState());
    });
    it('the id of the group in the store should have changed', function () {
      expect(state.Group[2]).toBeUndefined();
      expect(state.Group[456]).toBeDefined();
    });
    it('the related users should also update the id of the group', function () {
      expect(state.User[3].group).toBe(456);
      expect(state.User[4].group).toBe(456);
      expect(state.User[145].group).toBe(456);
    });
  });

  describe.skip('when using selectors to retrieve a group', function () {
    it('the group should have users populated', function () {
    });
  });

});
