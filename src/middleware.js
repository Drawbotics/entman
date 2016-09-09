import 'whatwg-fetch';
import get from 'lodash/get';

import {
  createEntities,
  updateEntityId,
} from './actions';


const LOAD_ENTITIES = 'LOAD_ENTITIES';

function loadEntitiesAction(schema) {
  return {
    type: LOAD_ENTITIES,
    payload: {
      schema,
    },
  };
}


function loadEntitiesDone(schema, data, action) {
  return {
    ...action,
    type: action.type + '_DONE',
    meta: {
      ...action.meta,
      entityAction: createEntities(schema, data),
    },
  };
}


const SAVE_ENTITY = 'SAVE_ENTITY';

function saveEntityAction(schema, id) {
  return {
    type: SAVE_ENTITY,
    payload: {
      schema,
      id,
    },
  };
}


function saveEntityDone(schema, data, oldId, action) {
  console.log('action', action);
  console.log(data);
  return {
    ...action,
    type: action.type + '_DONE',
    meta: {
      ...action.meta,
      entityAction: updateEntityId(schema, oldId, data.id),
    },
  };
}


// ------------------
// HELPERS
export function loadEntities(schema, action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: loadEntitiesAction(schema),
    },
  };
}


export function saveEntity(schema, id, action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: saveEntityAction(schema, id),
    },
  };
}
// -------------------


export default function entities(config) {
  const finalConfig = {
    host: '',
    namespace: 'api',
    stateHook: 'entities',
    ...config
  };
  return store => next => action => {
    if ( ! action.meta || ! action.meta.entityAction) {
      return next(action);
    }

    // Dispatch loading action
    next(action);

    const { host, namespace, stateHook } = finalConfig;
    const entityAction = action.meta.entityAction;
    const entitiesState = get(store.getState(), stateHook);

    switch (entityAction.type) {
      case LOAD_ENTITIES: {
        const originalActionType = action.type;
        const { schema } = entityAction.payload;
        const entityName = schema.getKey().toLowerCase();
        fetch(`${host}/${namespace}/${entityName}`)
          .then(response => response.json())
          .then(json => next(loadEntitiesDone(schema, json, action)))
          .catch(err => console.error(err));
        break;
      }
      case SAVE_ENTITY: {
        const originalActionType = action.type;
        const { schema, id } = entityAction.payload;
        const entityToSave = entitiesState[schema.getKey()][id];
        const entityName = schema.getKey().toLowerCase();
        fetch(`${host}/${namespace}/${entityName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entityToSave),
        })
          .then(response => response.json())
          .then(json => next(saveEntityDone(schema, json, id, action)))
          .catch(err => console.error(err));
        break;
      }
    }
  };
}
