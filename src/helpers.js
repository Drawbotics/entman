import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { normalize } from 'normalizr';
import { v4 } from 'node-uuid';

import { getEntitiesSlice } from './selectors';


function normalizeData(schema, data) {
  let normalizedData = data;
  if (Array.isArray(data)) {
    data = data.map((e) => e.id ? e : { ...e, id: v4() });
    normalizedData = normalize(data, [ schema ]);
  }
  else {
    data = data.id ? data : { ...data, id: v4() };
    normalizedData = normalize(data, schema);
  }
  return normalizedData;
}


function extractEntities(entitiesAndKey) {
  return Object.keys(entitiesAndKey.entities).map((id) => ({
    entity: {
      ...entitiesAndKey.entities[id],
      id,
    },
    key: entitiesAndKey.key,
  }));
}


function getFromState(state, key, id) {
  return get(getEntitiesSlice(state), [key, id]);
}


// We try to dispatch the actions of the orignal entities
// (the ones which schema was passed) first
function sortMainFirst(main) {
  return (entity1, entity2) => {
    if (entity1.key === main.key) {
      return -1;
    }
    else if (entity2.key === main.key) {
      return 1;
    }
    return 0;
  };
}


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
  return (dispatch) => {
    dispatch(action);
    const skipNormalization = get(action, 'meta.skipNormalization');
    const data = skipNormalization ? get(action, dataPath) : normalizeData(schema, get(action, dataPath));
    // Create an action for every entity and dispatch it
    const actions = Object.keys(data.entities)
      .map((key) => ({ entities: data.entities[key], key }))
      .reduce((memo, entitiesAndKey) => [
        ...memo,
        ...extractEntities(entitiesAndKey),
      ], [])
      .sort(sortMainFirst(schema))
      .map((entity) => ({
        type: `@@entman/CREATE_ENTITY_${entity.key.toUpperCase()}`,
        payload: entity,
        meta: { entmanAction: true, type: 'CREATE_ENTITY' },
      }));
    actions.forEach(dispatch);
  };
}


export function updateEntities(schema, ids, dataPath, action) {
  if ( ! schema || ! schema.key) {
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
    const actions = Object.keys(data.entities)
      .map((key) => ({ entities: data.entities[key], key }))
      .reduce((memo, entitiesAndKey) => [
        ...memo,
        ...extractEntities(entitiesAndKey),
      ], [])
      .map((entity) => ({ ...entity, oldEntity: getFromState(getState(), entity.key, entity.entity.id) }))
      .map((payload) => ({
        type: `@@entman/UPDATE_ENTITY_${payload.key.toUpperCase()}`,
        payload: payload,
        meta: { entmanAction: true, type: 'UPDATE_ENTITY' },
      }));
    actions.forEach(dispatch);
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
  return (dispatch, getState) => {
    dispatch(action);
    dispatch({
      type: `@@entman/UPDATE_ENTITY_ID_${schema.key.toUpperCase()}`,
      payload: { oldId, newId, oldEntity: getFromState(getState(), schema.key, oldId) },
      meta: { entmanAction: true, type: 'UPDATE_ENTITY_ID' },
    });
  };
}


export function deleteEntities(schema, ids, action) {
  if ( ! schema || ! schema.key) {
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
  return (dispatch, getState) => {
    dispatch(action);
    // Do we cascade delete?
    const actions = ids
      .map((id) => ({ id, key: schema.key }))
      .map((info) => ({ entity: getFromState(getState(), info.key, info.id), key: info.key }))
      .map((payload) => ({
        type: `@@entman/DELETE_ENTITY_${schema.key.toUpperCase()}`,
        payload,
        meta: { entmanAction: true, type: 'DELETE_ENTITY' },
      }));
    actions.forEach(dispatch);
  };
}
