import { combineReducers } from 'redux';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import mapValues from 'lodash/mapValues';

import {
  update,
  defaultTo,
  arrayFrom,
} from './utils';


// MAIN REDUCER FUNCTIONS {{{
function createEntity(state, action) {
  const { entity } = action.payload;
  return {
    ...state,
    [entity.id]: entity,
  };
}


function updateEntity(state, action) {
  const { entity } = action.payload;
  return {
    ...state,
    [entity.id]: update(state[entity.id], omit(entity, 'id')),
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
// }}}


// RELATED ENTITIES REDUCER FUNCTIONS {{{
function addToManyProperty(state, action, relation) {
  const { entity: foreignEntity } = action.payload;
  const { to, through, foreign } = relation;
  const entityToUpdate = get(state, get(foreignEntity, foreign));
  if ( ! entityToUpdate) {
    // Don't do anything if the parent entity doesn't exist
    return state;
  }
  if (get(entityToUpdate, through, []).find((id) => id == foreignEntity.id)) {
    return state;  // Don't do anything if the entity is already on the state
  }
  return {
    ...state,
    [entityToUpdate.id]: {
      ...entityToUpdate,
      [through]: [
        ...get(entityToUpdate, through, []),
        foreignEntity.id,
      ],
    },
  };
}

function deleteFromManyProperty(state, action, relation) {
  const { entity: foreignEntity } = action.payload;
  const { to, through, foreign } = relation;
  const entityToUpdate = get(state, get(foreignEntity, foreign));
  if ( ! entityToUpdate) {
    // Don't do anything if the parent entity doesn't exist
    return state;
  }
  return {
    ...state,
    [entityToUpdate.id]: {
      ...entityToUpdate,
      [through]: get(entityToUpdate, through, []).filter((id) => id != foreignEntity.id)
    },
  };
}

function updateRelation(state, action, relation) {
  const { entity: foreignEntity, oldEntity: oldForeignEntity } = action.payload;
  const { through, foreign } = relation;
  if (get(foreignEntity, foreign) === undefined || isEqual(get(foreignEntity, foreign), get(oldForeignEntity, foreign))) {
    return state;  // No need to update because the prop has not been updated
  }
  const newParentEntitiesIds = arrayFrom(get(foreignEntity, foreign)).map(String);
  const oldParentEntitiesIds = arrayFrom(get(oldForeignEntity, foreign)).map(String);
  return mapValues(state, (entity) => {
    if (newParentEntitiesIds.includes(entity.id) && get(entity, through).find((id) => id == foreignEntity.id) === undefined) {
      return {
        ...entity,
        [through]: [
          ...get(entity, through, []),
          foreignEntity.id,
        ],
      };
    }
    if (oldParentEntitiesIds.includes(entity.id) && ! newParentEntitiesIds.includes(entity.id)) {
      return {
        ...entity,
        [through]: get(entity, through, []).filter((id) => id != foreignEntity.id)
      };
    }
    return entity;
  });
}

function updateRelatedId(state, action, relation) {
  const { newId, oldId } = action.payload;
  const { isMany, through } = relation;
  if (isMany) {
    return mapValues(state, (entity) => ({
      ...entity,
      [through]: get(entity, through).map((id) => id == oldId ? newId : id),
    }));
  }
  else {
    return mapValues(state, (entity) => ({
      ...entity,
      [through]: get(entity, through) == oldId ? newId : get(entity, through),
    }));
  }
}

function deleteOneProperty(state, action, relation) {
  const { entity: foreignEntity } = action.payload;
  const { through, foreign } = relation;
  return mapValues(state, (entity) => ({
    ...entity,
    [through]: get(entity, through) == foreignEntity.id ? null : get(entity, through),
  }));
}
// }}}


function createOneRelationReactions(relation) {
  const { to } = relation;
  return {
    [`@@entman/DELETE_ENTITY_${to.toUpperCase()}`]: (state, action) => {
      return deleteOneProperty(state, action, relation);
    },
    [`@@entman/UPDATE_ENTITY_ID_${to.toUpperCase()}`]: (state, action) => {
      return updateRelatedId(state, action, relation);
    },
  };
}


function createManyRelationReactions(relation) {
  const { to } = relation;
  return {
    [`@@entman/CREATE_ENTITY_${to.toUpperCase()}`]: (state, action) => {
      return addToManyProperty(state, action, relation);
    },
    [`@@entman/DELETE_ENTITY_${to.toUpperCase()}`]: (state, action) => {
      return deleteFromManyProperty(state, action, relation);
    },
    [`@@entman/UPDATE_ENTITY_${to.toUpperCase()}`]: (state, action) => {
      return updateRelation(state, action, relation);
    },
    [`@@entman/UPDATE_ENTITY_ID_${to.toUpperCase()}`]: (state, action) => {
      return updateRelatedId(state, action, relation);
    }
  };
}


// The entity in state reacts to the entity in relation
function createRelationReactions(relation) {
  if (relation.isMany) {  // relation is going to be an array (e.g. users)
    return createManyRelationReactions(relation);
  }
  else {
    return createOneRelationReactions(relation);
  }
}


function createEntityReducer(entitySchema) {
  const entityName = entitySchema.key;
  const relations = entitySchema.getRelations();
  const reactionsToRelations = relations
    .map(createRelationReactions)
    .reduce((memo, reactions) => ({ ...memo, ...reactions }), {});
  return (state={}, action) => {
    switch (action.type) {
      case `@@entman/CREATE_ENTITY_${entityName.toUpperCase()}`: {
        return createEntity(state, action);
      }
      case `@@entman/UPDATE_ENTITY_${entityName.toUpperCase()}`: {
        return updateEntity(state, action);
      }
      case `@@entman/DELETE_ENTITY_${entityName.toUpperCase()}`: {
        return deleteEntity(state, action);
      }
      case `@@entman/UPDATE_ENTITY_ID_${entityName.toUpperCase()}`: {
        return updateEntityId(state, action);
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
