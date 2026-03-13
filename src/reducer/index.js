import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import createEntityReducer from './entity';


function createReducer(schemas, initialState={}) {
  const entitiesReducers = Object.keys(schemas).reduce((memo, k) => ({
    ...memo,
    [k]: createEntityReducer(schemas[k], initialState[k]),
  }), {});
  return combineReducers(entitiesReducers);
}


export default function entities(schemas, initialState) {
  if (!schemas || (typeof schemas === 'object' && Object.keys(schemas).length === 0)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  return enableBatching(createReducer(schemas, initialState));
}
