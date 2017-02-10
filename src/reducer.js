import { combineReducers } from 'redux';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';

import * as EntitiesActions from './actions';
import {
  update,
  defaultTo,
} from './utils';


function createEntities(state, action) {
  const { entities } = action.payload;
  return {
    ...state,
    ...entities,
  };
}


function updateEntities(state, action) {
  const { entities } = action.payload;
  return Object.keys(entities).reduce((memo, id) => ({
    ...memo,
    [id]: update(memo[id], omit(entities[id], 'id')),
  }), state);
}


function updateEntitiesIds(state, action) {
  const { ids } = action.payload;
  /*
    const { key, schema, oldId, newId } = action.payload;
    const updatedEntity = { ...state[key][oldId], id: newId };
    return mapValues(state, (currentEntities, key) => {
      // The entities we need to update
      if (key === schema.getKey()) {
        return omit({
          ...currentEntities,
          [newId]: updatedEntity,
        }, oldId);
      }
      // No related entities, so no need to perform any update
      if ( ! schema.isRelatedTo(key)) {
        return currentEntities;
      }
      // The entities are related
      const { isParent, relatedPropName } = schema.getRelation(updatedEntity, key);
      if (isParent) {
        // TODO: The entity is a OneToOne relation
        return currentEntities;
      }
      // The entities are the 'many' part in a OneToMany relation
      return mapValues(currentEntities, (entity) => {
        if (entity[relatedPropName] !== oldId) {
          return entity;
        }
        return {
          ...entity,
          [relatedPropName]: newId,
        };
      });
    });
  */
}


function deleteEntities(state, action) {
  const { ids } = action.payload;
  return omit(state, ids);
}


function createEntityReducer(entitySchema) {
  const entityName = entitySchema.getKey();
  return (state={}, action) => {
    switch (action.type) {
      case `@@entman/CREATE_ENTITIES_${entityName.toUpperCase()}`: {
        return createEntities(state, action);
      }
      case `@@entman/UPDATE_ENTITIES_${entityName.toUpperCase()}`: {
        return updateEntities(state, action);
      }
      case `@@entman/DELETE_ENTITIES_${entityName.toUpperCase()}`: {
        return deleteEntities(state, action);
      }
      case `@@entman/UPDATE_ENTITIES_IDS_${entityName.toUpperCase()}`: {
        return updateEntitiesIds(state, action);
      }
      default:
        return state;
    }
  }
}


function createReducer(schemas) {
  const entitiesReducers = Object.keys(schemas).reduce((memo, k) => ({
    ...memo,
    [k]: createEntityReducer(schemas[k]),
  }), {});
  return combineReducers(entitiesReducers);
}


export default function entities(schemas) {
  if (isEmpty(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  return createReducer(schemas);
}
