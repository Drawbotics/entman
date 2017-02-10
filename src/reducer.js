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


// MAIN REDUCER FUNCTIONS {{{
function createEntity(state, action) {
  const { entity } = action.payload;
  return {
    ...state,
    [entity.id]: entity,
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
// }}}


// RELATED ENTITIES REDUCER FUNCTIONS {{{
function addToManyProperty(state, action, relation) {
  const { entity: foreignEntity } = action.payload;
  const { to, through, foreign } = relation;
  const entityToUpdate = state[foreignEntity[foreign]];
  if (entityToUpdate[through].find((id) => id == foreignEntity.id)) {
    return state;  // Don't do anything if the entity is already on the state
  }
  return {
    ...state,
    [entityToUpdate.id]: {
      ...entityToUpdate,
      [through]: [
        ...entityToUpdate[through],
        foreignEntity.id,
      ],
    },
  };
}
// }}}



function createOneRelationReactions(relation) {
  return {
    // This would only be useful in OneToOne relationships, for now, it's not supported (or not necessary)
  };
}


function createManyRelationReactions(relation) {
  const { to, through, foreign } = relation;
  return {
    [`@@entman/CREATE_ENTITY_${to.toUpperCase()}`]: (state, action) => {
      return addToManyProperty(state, action, relation);
    },
  };
}


// The entity in state reacts to the entity in relation
function createRelationReactions(relation) {
  if (relation.isMany) {
    return createManyRelationReactions(relation);
  }
  else {
    return createOneRelationReactions(relation);
  }
}


function createEntityReducer(entitySchema) {
  const entityName = entitySchema.getKey();
  const relations = entitySchema.getRelations();
  const reactionsToRelations = relations
    .map(createRelationReactions)
    .reduce((memo, reactions) => ({ ...memo, ...reactions }), {});
  return (state={}, action) => {
    switch (action.type) {
      case `@@entman/CREATE_ENTITY_${entityName.toUpperCase()}`: {
        return createEntity(state, action);
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
        const reaction = reactionsToRelations[action.type];
        return (typeof reaction === 'function') ? reaction(state, action) : state;
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
