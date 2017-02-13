import get from 'lodash/get';
import v4 from 'uuid/v4';
import { normalize } from 'normalizr';

import { arrayFrom } from './utils';


function normalizeData(schema, data) {
  let normalizedData = data;
  const dataWithIds = arrayFrom(data).map((e) => e.id ? e : { ...e, id: v4() });
  return normalize(dataWithIds, [ schema ]);
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


function createEntityActions(action) {
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


function processEntmanAction(store, next, action) {
  switch (action.meta.type) {
    case 'CREATE_ENTITIES': {
      return createEntityActions(action).forEach(next);
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
