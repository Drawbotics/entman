import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';

import { update, defaultTo } from '../utils';
import createReactions from './create-reactions';


function createEntity(state, action) {
  const { entity } = action.payload;
  return { ...state, [entity.id]: entity };
}


function updateEntity(state, action) {
  const { entity, useDefault } = action.payload;
  const data = omit(entity, 'id');
  return {
    ...state,
    [entity.id]: useDefault ? defaultTo(state[entity.id], data) : update(state[entity.id], data),
  };
}


function updateEntityId(state, action) {
  const { oldId, newId } = action.payload;
  return {
    ...omit(state, oldId),
    [newId]: { ...state[oldId], id: newId },
  };
}


function deleteEntity(state, action) {
  const { entity } = action.payload;
  return omit(state, entity.id);
}


export default function createEntityReducer(schema, initialState={}) {
  const reactions = createReactions(schema.getRelations());
  if ( ! isPlainObject(initialState)) {
    throw new Error(`Invalid initial state for ${schema.key}. Initial state of an entity should be a plain object`);
  }
  return (state=initialState, action) => {
    switch (action.type) {
      case `@@entman/CREATE_ENTITY_${schema.key.toUpperCase()}`: {
        return createEntity(state, action);
      }
      case `@@entman/UPDATE_ENTITY_${schema.key.toUpperCase()}`: {
        return updateEntity(state, action);
      }
      case `@@entman/DELETE_ENTITY_${schema.key.toUpperCase()}`: {
        return deleteEntity(state, action);
      }
      case `@@entman/UPDATE_ENTITY_ID_${schema.key.toUpperCase()}`: {
        return updateEntityId(state, action);
      }
      default: {
        const reaction = reactions[action.type];
        return (typeof reaction === 'function') ? reaction(state, action) : state;
      }
    }
  };
}
