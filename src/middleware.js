import get from 'lodash/get';
import v4 from 'uuid/v4';
import { normalize } from 'normalizr';

import { getEntitiesSlice } from './selectors';
import { arrayFrom } from './utils';


// UTILS {{{
function normalizeData(schema, data) {
  const dataWithIds = arrayFrom(data).map((e) => e.id ? e : { ...e, id: v4() });
  return normalize(dataWithIds, [ schema ]);
}


function extractEntities(entitiesAndKey) {
  return Object.keys(entitiesAndKey.entities).map((id) => ({
    entity: {
      ...entitiesAndKey.entities[id],
      id: entitiesAndKey.entities[id].id ? entitiesAndKey.entities[id].id : id,
    },
    key: entitiesAndKey.key,
  }));
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


function getFromState(state, key, id) {
  return get(getEntitiesSlice(state), [key, id]);
}
// }}}



function createCreateEntityActions(action) {
  const dataPath = get(action, 'meta.dataPath');
  const schema = get(action, 'meta.schema');
  const skipNormalization = get(action, 'meta.skipNormalization');
  const data = skipNormalization ? get(action, dataPath) : normalizeData(schema, get(action, dataPath));
  return Object.keys(data.entities)
    .map((key) => ({ entities: data.entities[key], key }))
    .reduce((memo, entitiesAndKey) => [ ...memo, ...extractEntities(entitiesAndKey) ], [])
    .sort(sortMainFirst(schema))
    .map((payload) => ({
      type: `@@entman/CREATE_ENTITY_${payload.key.toUpperCase()}`,
      payload,
    }));
}


function createUpdateEntityActions(action, getState) {
  const dataPath = get(action, 'meta.dataPath');
  const schema = get(action, 'meta.schema');
  const ids = get(action, 'meta.ids');
  const useDefault = get(action, 'meta.useDefault');
  const data = normalizeData(schema, ids.map((id) => ({ ...get(action, dataPath), id })));
  return Object.keys(data.entities)
    .map((key) => ({ entities: data.entities[key], key }))
    .reduce((memo, entitiesAndKey) => [ ...memo, ...extractEntities(entitiesAndKey) ], [])
    .map((entity) => ({ ...entity, oldEntity: getFromState(getState(), entity.key, entity.entity.id) }))
    .sort(sortMainFirst(schema))
    .map((payload) => ({
      type: `@@entman/UPDATE_ENTITY_${payload.key.toUpperCase()}`,
      payload: { ...payload, useDefault },
    }));
}


function createUpdateEntityIdActions(action, getState) {
  const schema = get(action, 'meta.schema');
  const oldId = get(action, 'meta.oldId');
  const newId = get(action, 'meta.newId');
  return [{
    type: `@@entman/UPDATE_ENTITY_ID_${schema.key.toUpperCase()}`,
    payload: { oldId, newId, oldEntity: getFromState(getState(), schema.key, oldId) },
  }];
}


function createDeleteEntityActions(action, getState) {
  const schema = get(action, 'meta.schema');
  const ids = get(action, 'meta.ids');
  // Do we cascade delete?
  return ids
    .map((id) => ({ id, key: schema.key }))
    .map((info) => ({ entity: getFromState(getState(), info.key, info.id), key: info.key }))
    .map((payload) => ({
      type: `@@entman/DELETE_ENTITY_${schema.key.toUpperCase()}`,
      payload,
    }));
}


function processEntmanAction(store, next, action) {
  switch (action.meta.type) {
    case 'CREATE_ENTITIES': {
      return createCreateEntityActions(action).forEach(next);
    }
    case 'UPDATE_ENTITIES': {
      return createUpdateEntityActions(action, store.getState).forEach(next);
    }
    case 'UPDATE_ENTITY_ID': {
      return createUpdateEntityIdActions(action, store.getState).forEach(next);
    }
    case 'DELETE_ENTITIES': {
      return createDeleteEntityActions(action, store.getState).forEach(next);
    }
    default: {
      console.warn(`[ENTMAN] Unknown action type found ${action.meta.type}`);
      return next(action);
    }
  }
}


export default function entman(store) {
  return (next) => (action) => {
    if ( ! get(action, 'meta.isEntmanAction', false)) {
      return next(action);
    }
    next(action);
    return processEntmanAction(store, next, action);
  };
}
