import { expect } from 'chai';

import { populate } from 'utils';
import { denormalize } from 'denormalizr';
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
    state = {
      Group: {
        1: { id: 1, name: 'Group 1' },
        2: { id: 2, name: 'Group 2' },
      },
      User: {
        1: { id: 1, name: 'Lars', group: 1 },
        2: { id: 2, name: 'Grishan', group: 2 },
      },
      Task: {
        1: { id: 1, title: 'Do something', user: 1 },
      },
    };
    schemas = generateSchemas([group, user, task]);
  });
  describe('populate(schema, entity, entities)', function () {
    it('should populate the entity', function () {
      const entity = state.Group[1];
      const result = populate(schemas.Group, entity, state);
      const result2 = denormalize(entity, state, schemas.Group);
      console.log('result', result);
      console.log('result2', result2);
    });
  });
});
