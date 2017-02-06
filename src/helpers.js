import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { normalize, arrayOf } from 'normalizr';
import { v4 } from 'node-uuid';

import actions from './actions';


function normalizeData(schema, data, options) {
  let normalizedData = data;
  if (Array.isArray(data)) {
    data = data.map((e) => e.id ? e : { ...e, id: v4() });
    normalizedData = normalize(data, arrayOf(schema));
  }
  else {
    data = data.id ? data : { ...data, id: v4() };
    normalizedData = normalize(data, schema);
  }
  return normalizedData;
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
  return (dispatch) => {
    dispatch(action);
    const skipNormalization = get(action, 'meta.skipNormalization');
    const data = skipNormalization ? get(action, dataPath) : normalizeData(schema, get(action, dataPath));
    // Create an action for every entity and dispatch it
    const actions = Object.keys(data.entities).map((key) => ({
      type: `@@entman/CREATE_ENTITIES_${key.toUpperCase()}`,
      payload: { entities: data.entities[key], key },
      meta: { entmanAction: true, type: 'CREATE_ENTITIES' },
    }));
    actions.forEach(dispatch);
  };
}


export function updateEntities(schema, ids, dataPath, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
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
  return (dispatch, getState) => {
    dispatch(action);
    const dataWithIds = ids.map((id) => ({ ...get(action, dataPath), id }));
    const data = normalizeData(schema, dataWithIds);
    const actions = Object.keys(data.entities).map((key) => ({
      type: `@@entman/UPDATE_ENTITIES_${key.toUpperCase()}`,
      payload: { entities: data.entities[key], key },
      meta: { entmanAction: true, type: 'UPDATE_ENTITIES' },
    }));
    actions.forEach(dispatch);
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


export function deleteEntities(schema, ids, action) {
  if ( ! schema || ! schema.getKey) {
    throw new Error(`[INVALID SCHEMA]: Entity schema expected instead of ${schema}`);
  }
  if ( ! ids) {
    throw new Error('[INVALID ID]');
  }
  if ( ! Array.isArray(ids)) {
    ids = [ids];
  }
  if (isEmpty(action) || ! action.hasOwnProperty('type')) {
    throw new Error('[INVALID ACTION]');
  }
  return (dispatch) => {
    dispatch(action);
    // Do we cascade delete?
    dispatch({
      type: `@@entman/DELETE_ENTITIES_${schema.getKey().toUpperCase()}`,
      payload: { ids, key: schema.getKey() },
      meta: { entmanAction: true, type: 'DELETE_ENTITIES' },
    });
  };
}
