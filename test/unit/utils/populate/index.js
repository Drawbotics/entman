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
        1: { id: 1, name: 'Group 1' },
        2: { id: 2, name: 'Group 2' },
      },
      User: {
        1: { id: 1, name: 'Lars', group: 1 },
        2: { id: 2, name: 'Grishan', group: 1 },
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
    it('should initialize empty relations as empty attributes', function () {
      const entity = state.Group[2];
      const result = populate(schemas.Group, entity, state);
      expect(result.users).to.exist;
      expect(result.users).to.have.length(0);
    });
    it('should keep a reference to the parent entity from the child entity', function () {
      const result = populate(schemas.Group, entity, state);
      const user1 = result.users.find(u => u.id === 1);
      expect(user1.group.name).to.equal('Group 1');
    });
    it('should populate the grandchildren of the entity', function () {
      const result = populate(schemas.Group, entity, state);
      const user1 = result.users.find(u => u.id === 1);
      expect(user1.tasks).to.have.length(1);
      const task1 = user1.tasks.find(t => t.id === 1);
      expect(task1.title).to.equal('Do something');
    });
    it('should keep a reference to the parent entity of the grandchild entity', function () {
      const result = populate(schemas.Group, entity, state);
      const user1 = result.users.find(u => u.id === 1);
      expect(user1.tasks).to.have.length(1);
      const task1 = user1.tasks.find(t => t.id === 1);
      expect(task1.user.name).to.equal('Lars');
    });
    it('should keep a reference to the grandparent of the grandchild entity', function () {
      const result = populate(schemas.Group, entity, state);
      const user1 = result.users.find(u => u.id === 1);
      expect(user1.tasks).to.have.length(1);
      const task1 = user1.tasks.find(t => t.id === 1);
      console.log(task1.user.group);
      expect(task1.user.group.name).to.equal('Group 1');
    });
  });
});
