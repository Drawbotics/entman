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
        user: 'User',
        category: 'Category',
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
    beforeAll(function () {
      entities = getEntities(state, schemas.Group);
    });
    it('should return all the entities of schema = `schema`', function () {
      expect(entities).toHaveLength(2);
      expect(entities.some(e => e.id === 1)).toBe(true);
      expect(entities.some(e => e.id === 2)).toBe(true);
    });
    it('should populate all relationships', function () {
      const group1 = entities.find(e => e.id === 1);
      expect(group1.users).toHaveLength(2);
      expect(group1.users.some(u => u.id === 1)).toBe(true);
      expect(group1.users.some(u => u.id === 2)).toBe(true);
    });
  });
  describe('getEntitiesBy(state, schema, by={})', function () {
    let entities;
    beforeAll(function () {
      entities = getEntitiesBy(state, schemas.Group, { name: 'Group 1' });
    });
    it('should return all the entities of schema = `schema` that fulfil the condition `by`', function () {
      expect(entities).toHaveLength(1);
      expect(entities[0].id).toBe(1);
    });
    it('should return an empty array when no entity fulfil the condition `by`', function () {
      const entities = getEntitiesBy(state, schemas.Group, { name: 'asdfa' });
      expect(Array.isArray(entities)).toBe(true);
      expect(entities).toHaveLength(0);
    });
    it('should populate all relationships', function () {
      const group1 = entities.find(e => e.id === 1);
      expect(group1.users).toHaveLength(2);
      expect(group1.users.some(u => u.id === 1)).toBe(true);
      expect(group1.users.some(u => u.id === 2)).toBe(true);
    });
  });
  describe('getEntity(state, schema, id)', function () {
    let entity;
    beforeAll(function () {
      entity = getEntity(state, schemas.Group, 1);
    });
    it('should throw an error if no `id` is specified', function () {
      const result = () => getEntity(state, schemas.Group);
      expect(result).toThrow(/Required param/);
    });
    it('should return the entity of schema = `schema` with the specified `id`', function () {
      expect(entity.id).toBe(1);
    });
    it('should populate all relationships', function () {
      const group1 = entity;
      expect(group1.users).toHaveLength(2);
      expect(group1.users.some(u => u.id === 1)).toBe(true);
      expect(group1.users.some(u => u.id === 2)).toBe(true);
    });
  });
});
