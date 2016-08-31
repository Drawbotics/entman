import { expect } from 'chai';

import {
  defineSchema,
  hasMany,
  generateSchema,
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
    it('the resulted object should have a property called `relatedEntity` with the name of the passed schema', function () {
      const name = 'User';
      const result = hasMany(name);
      expect(result.relatedEntity).to.equal(name);
    });
    it('the resulted object should have a property called `isArray` with value `true`', function () {
      const result = hasMany('User');
      expect(result.isArray).to.equal(true);
    });
  });
  describe('generateSchemas()', function () {
  });
});
