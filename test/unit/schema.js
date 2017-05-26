import { expect } from 'chai';
import { schema as Schema } from 'normalizr';

import {
  defineSchema,
  hasMany,
  generateSchemas,
} from 'schema';


describe('@Schema', function () {
  describe('defineSchema(name, config)', function () {
    it('should throw an error when `name` is empty', function () {
      expect(() => defineSchema()).to.throw(/INVALID NAME/);
    });
    it('should throw an error when `config` is not an object', function () {
      expect(() => defineSchema('Test', () => {})).to.throw(/INVALID CONFIG/);
      expect(() => defineSchema('Test', 123)).to.throw(/INVALID CONFIG/);
    });
    it('should return an object', function () {
      const result = defineSchema('Test');
      expect(result).to.be.an('object');
    });
    it('the schema object should have a property with the name of the schema', function () {
      const name = 'Test';
      const result = defineSchema(name);
      expect(result.name).to.equal(name);
    });
    it('the schema object should have a property with the attributes of the schema', function () {
      const name = 'Test';
      const attributes = { user: 'User' };
      const result = defineSchema(name, { attributes });
      expect(result.config.attributes).to.deep.equal(attributes);
      expect(defineSchema(name).config.attributes).to.be.an('object');
    });
  });
  describe('hasMany(schema)', function () {
    it('should throw an error when `schema` is empty', function () {
      expect(() => hasMany()).to.throw(/INVALID SCHEMA/);
    });
    it('should throw an error if `schema` is not a string or a schema object', function () {
      expect(() => hasMany(123)).to.throw(/INVALID SCHEMA/);
      expect(() => hasMany({})).to.throw(/INVALID SCHEMA/);
      expect(() => hasMany('User')).to.not.throw(/INVALID SCHEMA/);
      expect(() => hasMany({ name: 'User' })).to.not.throw(/INVALID SCHEMA/);
    });
    it('should return an object', function () {
      const result = hasMany('User');
      expect(result).to.be.an('object');
    });
    it('the resulted object should have a property called `relatedSchema` with the name of the passed schema', function () {
      const name = 'User';
      const result = hasMany(name);
      expect(result.relatedSchema).to.equal(name);
    });
    it('the resulted object should have a property called `isArray` with value `true`', function () {
      const result = hasMany('User');
      expect(result.isArray).to.equal(true);
    });
  });
  describe('generateSchemas(schemas)', function () {
    it('should throw an error if `schemas` is empty', function () {
      expect(() => generateSchemas()).to.throw(/INVALID SCHEMAS/);
    });
    it('should throw an error if `schemas` is not an array', function () {
      expect(() => generateSchemas({})).to.throw(/INVALID SCHEMAS/);
      expect(() => generateSchemas(123)).to.throw(/INVALID SCHEMAS/);
    });
    it('should return an object', function () {
      const user = defineSchema('User');
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result).to.be.an('object');
    });
    it('the keys of the resulted object should match the schemas names', function () {
      const user = defineSchema('User');
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result).to.include.keys('User');
      expect(result).to.include.keys('Group');
    });
    it('the resulted object should contain valid schemas', function () {
      const user = defineSchema('User', {
        attributes: {
          group: 'Group',
        }
      });
      const group = defineSchema('Group', {
        attributes: {
          users: hasMany('User'),
          getNumberOfUsers() {
            return this.users.length;
          }
        }
      });
      const result = generateSchemas([user, group]);
      expect(result.Group.key).to.equal('Group');
      expect(result.User.key).to.equal('User');
      expect(result.Group).to.an.instanceof(Schema.Entity);
      expect(result.User).to.an.instanceof(Schema.Entity);
    });
    it('the resulted schemas should contain the right attributes', function () {
      const user = defineSchema('User', {
        attributes: {
          group: 'Group',
        }
      });
      const group = defineSchema('Group', {
        attributes: {
          users: hasMany('User'),
          getNumberOfUsers() {
            return this.users.length;
          }
        }
      });
      const result = generateSchemas([user, group]);
      expect(result.Group.schema).to.contain.keys(['users', '_computed']);
      expect(result.Group.schema._computed).to.contain.keys(['getNumberOfUsers']);
      expect(result.User.schema).to.contain.keys(['group']);
    });
    it('should add a method called `getRelations` to the generated schemas', function () {
      const user = defineSchema('User');
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result.User.getRelations).to.exist;
      expect(result.Group.getRelations).to.exist;
    });
    it('the method `getRelations` should return an array with the info of the relations of the schema', function () {
      const user = defineSchema('User', {
        attributes: {
          group: 'Group',
          tasks: hasMany('Task'),
        },
      });
      const group = defineSchema('Group', {
        attributes: {
          users: hasMany('User'),
        },
      });
      const task = defineSchema('Task', {
        attributes: {
          users: hasMany('User'),
        },
      });
      const result = generateSchemas([ user, group, task ]);
      const userRelations = [
        {
          through: 'group',
          isMany: false,
          foreign: 'users',
          to: 'Group',
        },
        {
          through: 'tasks',
          isMany: true,
          foreign: 'users',
          to: 'Task',
        },
      ];
      const groupRelations = [
        {
          through: 'users',
          isMany: true,
          foreign: 'group',
          to: 'User',
        },
      ];
      const taskRelations = [
        {
          through: 'users',
          isMany: true,
          foreign: 'tasks',
          to: 'User',
        },
      ];
      expect(result.Group.getRelations()).to.deep.equal(groupRelations);
      expect(result.User.getRelations()).to.deep.equal(userRelations);
      expect(result.Task.getRelations()).to.deep.equal(taskRelations);
    });
  });
});
