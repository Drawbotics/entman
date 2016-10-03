import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import actions from './actions';


export function createEntity(schema, dataPath, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if (isEmpty(dataPath) || (typeof dataPath !== 'string')) {
    throw new Error(`[INVALID DATA PATH]: Expected data path instead of ${dataPath}`);
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  if ( ! get(action, dataPath)) {
    console.warn(`No data found in action at ${dataPath}`);
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.createEntity(schema, get(action, dataPath)),
    },
  };
}


export function createEntities(schema, dataPath, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if (isEmpty(dataPath) || (typeof dataPath !== 'string')) {
    throw new Error(`[INVALID DATA PATH]: Expected data path instead of ${dataPath}`);
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  if ( ! get(action, dataPath)) {
    console.warn(`No data found in action at ${dataPath}`);
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.createEntities(schema, get(action, dataPath)),
    },
  };
}


export function updateEntity(schema, id, dataPath, action, defaulting) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! id) {
    throw new Error('[INVALID ID]');
  }
  if (isEmpty(dataPath) || (typeof dataPath !== 'string')) {
    throw new Error(`[INVALID DATA PATH]: Expected data path instead of ${dataPath}`);
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  if ( ! get(action, dataPath)) {
    console.warn(`No data found in action at ${dataPath}`);
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.updateEntity(schema, id, get(action, dataPath), defaulting),
    },
  };
}


export function updateEntities(schema, ids, dataPath, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! ids || ! Array.isArray(ids)) {
    throw new Error('[INVALID IDS]');
  }
  if (isEmpty(dataPath) || (typeof dataPath !== 'string')) {
    throw new Error(`[INVALID DATA PATH]: Expected data path instead of ${dataPath}`);
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  if ( ! get(action, dataPath)) {
    console.warn(`No data found in action at ${dataPath}`);
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.updateEntities(schema, ids, get(action, dataPath)),
    },
  };
}


export function updateEntityId(schema, oldId, newId, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! oldId) {
    throw new Error('[INVALID OLD ID]');
  }
  if ( ! newId) {
    throw new Error('[INVALID NEW ID]');
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.updateEntityId(schema, oldId, newId),
    },
  };
}


export function deleteEntity(schema, id, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! id) {
    throw new Error('[INVALID ID]');
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: actions.deleteEntity(schema, id),
    },
  };
}
