import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import { populate } from 'utils';
import { defineSchema, hasMany, generateSchemas } from 'schema';


describe('@Populate', function () {
  let schemas;
  let state;
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
    });
    state = deepFreeze({
      Group: {
        1: { id: 1, name: 'Group 1', users: [1, 2] },
        2: { id: 2, name: 'Group 2' },
      },
      User: {
        1: { id: 1, name: 'Lars', group: 1 },
        2: { id: 2, name: 'Grishan', group: 1 },
        3: { id: 3, name: 'Grishan', group: 2 },
      },
      Task: {
        1: { id: 1, title: 'Do something', user: 1 },
      },
    });
    schemas = generateSchemas([group, user, task]);
  });
  describe('populate(schema, entity, entities)', function () {
    let entity;
    before(function () {
      entity = state.Group[1];
    });
    it('should populate the children of the entity', function () {
      const result = populate(schemas.Group, entity, state);
      expect(result.users).to.have.length(2);
      const user1 = result.users.find(u => u.id === 1);
      const user2 = result.users.find(u => u.id === 2);
      expect(user1.name).to.equal('Lars');
      expect(user2.name).to.equal('Grishan');
    });
  });
});
