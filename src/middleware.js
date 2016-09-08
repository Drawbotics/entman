import 'whatwg-fetch';

import {
  createEntities,
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


export function loadEntities(schema, action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      entityAction: loadEntitiesAction(schema),
    },
  };
}


export default function entities(config) {
  const finalConfig = {
    host: '',
    namespace: 'api',
    ...config
  };
  return store => next => action => {
    if ( ! action.meta || ! action.meta.entityAction) {
      return next(action);
    }

    // Dispatch loading action
    next(action);

    const entityAction = action.meta.entityAction;
    const { host, namespace } = finalConfig;

    switch (entityAction.type) {
      case LOAD_ENTITIES: {
        const originalActionType = action.type;
        const { schema } = entityAction.payload;
        const entityName = schema.getKey().toLowerCase();
        fetch(`${host}/${namespace}/${entityName}`)
          .then(response => response.json())
          .then(json => next(loadEntitiesDone(schema, json, action)));
      }
    }
  };
}
