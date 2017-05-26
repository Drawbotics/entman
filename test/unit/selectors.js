import { expect } from 'chai';

import {
  defineSchema,
  generateSchemas,
  hasMany,
} from 'schema';
import {
  getEntities,
  getEntitiesBy,
  getEntity,
} from 'selectors';


describe('@Selectors', function () {
  let state;
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
        user: 'User',
        category: 'Category',
        //TODO: users: hasMany('User'),
      }
    });
    const category = defineSchema('Category', {
    });
    schemas = generateSchemas([group, user, task, category]);
    state = { entities: {
      Group: {
        1: { id: 1, name: 'Group 1', users: [ 1, 2 ] },
        2: { id: 2, name: 'Group 2', users: [ 3 ] },
      },
      User: {
        1: { id: 1, name: 'Lars', group: 1 },
        2: { id: 2, name: 'Grishan', group: 1 },
        3: { id: 3, name: 'Deathvoid', group: 2 },
      },
      Task: {
        1: { id: 1, title: 'Do something', user: 1 },
        2: { id: 2, title: 'Keep calm', user: 1, category: 1 },
      },
      Category: {
      },
    } };
  });
  describe('getEntities(state, schema)', function () {
    let entities;
    before(function () {
      entities = getEntities(state, schemas.Group);
    });
    it('should return all the entities of schema = `schema`', function () {
      expect(entities).to.have.length(2);
      expect(entities).to.satisfy(entities => entities.some(e => e.id === 1));
      expect(entities).to.satisfy(entities => entities.some(e => e.id === 2));
    });
    it('should populate all relationships', function () {
      const group1 = entities.find(e => e.id === 1);
      expect(group1.users).to.have.length(2);
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 1));
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 2));
    });
  });
  describe('getEntitiesBy(state, schema, by={})', function () {
    let entities;
    before(function () {
      entities = getEntitiesBy(state, schemas.Group, { name: 'Group 1' });
    });
    it('should return all the entities of schema = `schema` that fulfil the condition `by`', function () {
      expect(entities).to.have.length(1);
      expect(entities[0].id).to.equal(1);
    });
    it('should return an empty array when no entity fulfil the condition `by`', function () {
      const entities = getEntitiesBy(state, schemas.Group, { name: 'asdfa' });
      expect(entities).to.be.an('array');
      expect(entities).to.have.length(0);
    });
    it('should populate all relationships', function () {
      const group1 = entities.find(e => e.id === 1);
      expect(group1.users).to.have.length(2);
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 1));
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 2));
    });
  });
  describe('getEntity(state, schema, id)', function () {
    let entity;
    before(function () {
      entity = getEntity(state, schemas.Group, 1);
    });
    it('should throw an error if no `id` is specified', function () {
      const result = () => getEntity(state, schemas.Group);
      expect(result).to.throw(/Required param/);
    });
    it('should return the entity of schema = `schema` with the specified `id`', function () {
      expect(entity.id).to.equal(1);
    });
    it('should populate all relationships', function () {
      const group1 = entity;
      expect(group1.users).to.have.length(2);
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 1));
      expect(group1.users).to.satisfy(users => users.some(u => u.id === 2));
    });
    it('should not replace ids when related entity is not found', function () {
      const task = getEntity(state, schemas.Task, 2);
      expect(task.category).to.equal(1);
    });
  });
});
