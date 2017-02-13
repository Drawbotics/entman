import { combineReducers } from 'redux';
import isEmpty from 'lodash/isEmpty';

import createEntityReducer from './entity';


function createReducer(schemas) {
  const entitiesReducers = Object.keys(schemas).reduce((memo, k) => ({
    ...memo,
    [k]: createEntityReducer(schemas[k]),
  }), {});
  return combineReducers(entitiesReducers);
}


export default function entities(schemas) {
  if (isEmpty(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  return createReducer(schemas);
}