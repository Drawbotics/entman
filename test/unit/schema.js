import { expect } from 'chai';

import {
  defineSchema,
  hasMany,
  generateSchemas,
} from 'schema';


describe('@Schema', function () {
  describe('defineSchema(name, attributes)', function () {
    it('should throw an error when `name` is empty', function () {
      expect(() => defineSchema()).to.throw(/INVALID NAME/);
    });
    it('should throw an error when `attributes` is a function', function () {
      expect(() => defineSchema('Test', () => {})).to.throw(/INVALID ATTRIBUTES/);
      expect(() => defineSchema('Test', 123)).to.throw(/INVALID ATTRIBUTES/);
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
      const result = defineSchema(name, attributes);
      expect(result.attributes).to.deep.equal(attributes);
      expect(defineSchema(name).attributes).to.be.an('object');
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
        group: 'Group',
      });
      const group = defineSchema('Group', {
        users: hasMany('User'),
        getNumberOfUsers() {
          return this.users.length;
        }
      });
      const result = generateSchemas([user, group]);
      expect(result.Group.getKey()).to.equal('Group');
      expect(result.User.getKey()).to.equal('User');
    });
    it('should add a method called `isRelatedTo` to the generated schemas', function () {
      const user = defineSchema('User');
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result.User.isRelatedTo).to.exist;
      expect(result.Group.isRelatedTo).to.exist;
    });
    it('the method `isRelatedTo(entityName)` should return true when the entity is related to `entityName`', function () {
      const user = defineSchema('User', {
        group: 'Group',
      });
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result.User.isRelatedTo('Group')).to.be.true;
      expect(result.User.isRelatedTo('assdfa')).to.be.false;
    });
    it('should add a method called `getRelation` to the generated schemas', function () {
      const user = defineSchema('User');
      const group = defineSchema('Group');
      const result = generateSchemas([user, group]);
      expect(result.User.getRelation).to.exist;
      expect(result.Group.getRelation).to.exist;
    });
    it('the method `getRelation(entity, name)` should return an object with the info for the relation between entities when single relation', function () {
      const user = defineSchema('User', {
        group: 'Group',
      });
      const group = defineSchema('Group', {
        users: hasMany('User'),
      });
      const schemas = generateSchemas([user, group]);
      const userEntity = { id: 1, group: 1, name: 'Lars' };
      const expected = {
        related: 'Group',
        relatedPropName: 'users',
        relatedId: 1,
      };
      const result = schemas.User.getRelation(userEntity, 'Group');
      expect(result).to.deep.equal(expected);
    });
    it('the method `getRelation(entity, name)` should return an object with the info for the relation between entities when array relation');
  });
});
