import { expect } from 'chai';
import isEmpty from 'lodash/isEmpty';

import {
  createEntity,
} from 'helpers';


describe('@Helpers', function () {
  describe('createEntity(schema, dataPath)', function () {
    it('should return an error when `schema` is not a valid schema', function () {
      expect(() => createEntity()).to.throw(/INVALID SCHEMA/);
    });
    it('should return an error when `dataPath` is empty', function () {
    });
    it('should return a function', function () {
    });
    it('the result of the returned function should be an action', function () {
    });
    it('the type of the resulting action should be the specified in the wrapped action', function () {
    });
    it('should be a meta property called `entityAction` in the resulting action', function () {
    });
    it('the `entityAction` should have the type `CREATE_ENTITY`', function () {
    });
  });
});
