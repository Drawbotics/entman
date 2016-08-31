import get from 'lodash/get';

import actions from './actions';


export function createEntity(schema, dataPath) {
  if ( ! schema || ! schema._entitySchema) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if (isEmpty(dataPath) || (typeof dataPath !== 'string')) {
    throw new Error(`[INVALID DATA PATH]: Expected data path instead of ${dataPath}`);
  }
  return (wrappedAction) => {
    const result = wrappedAction();
  };
}


export function updateEntity(schema, id, dataPath, action, defaulting) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.updateEntity(schema, id, get(action, dataPath), defaulting),
    },
  };
}


export function updateEntityId(schema, oldId, newId, action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.updateEntityId(schema, oldId, newId),
    },
  };
}


export function deleteEntity(schema, id, action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.deleteEntity(schema, id),
    },
  };
}
