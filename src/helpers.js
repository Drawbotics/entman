import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';


export function createEntities(schema, dataPath, action) {
  if ( ! schema || ! schema.key) {
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
      isEntmanAction: true,
      type: 'CREATE_ENTITIES',
      dataPath,
      schema,
    },
  };
}


export function updateEntities(schema, ids, dataPath, action) {
  if ( ! schema || ! schema.key) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! ids) {
    throw new Error('[INVALID IDS]');
  }
  if ( ! Array.isArray(ids)) {
    ids = [ids];
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
      isEntmanAction: true,
      type: 'UPDATE_ENTITIES',
      ids,
      dataPath,
      schema,
    },
  };
}


export function updateEntityId(schema, oldId, newId, action) {
  if ( ! schema || ! schema.key) {
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
      isEntmanAction: true,
      type: 'UPDATE_ENTITY_ID',
      schema,
      oldId,
      newId,
    },
  };
}


export function deleteEntities(schema, ids, action) {
  if ( ! schema || ! schema.key) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! ids) {
    throw new Error('[INVALID IDS]');
  }
  if ( ! Array.isArray(ids)) {
    ids = [ids];
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  return {
    ...action,
    meta: {
      ...action.meta,
      isEntmanAction: true,
      type: 'DELETE_ENTITIES',
      ids,
      schema,
    },
  };
}
