import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import isEqual from 'lodash/isEqual';

import { arrayFrom } from 'utils';


function addToManyProperty(state, action, relation) {
  const { entity: foreignEntity } = action.payload;
  const { through, foreign } = relation;
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
  const { through, foreign } = relation;
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
  const newParentEntitiesIds = arrayFrom(get(foreignEntity, foreign));
  const oldParentEntitiesIds = arrayFrom(get(oldForeignEntity, foreign));
  return mapValues(state, (entity) => {
    const id = entity.id;
    if (newParentEntitiesIds.includes(id) && get(entity, through).find((id) => id == foreignEntity.id) === undefined) {
      return {
        ...entity,
        [through]: [
          ...get(entity, through, []),
          foreignEntity.id,
        ],
      };
    }
    if (oldParentEntitiesIds.includes(id) && ! newParentEntitiesIds.includes(entity.id)) {
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
      [through]: get(entity, through, []).map((id) => id == oldId ? newId : id),
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
  const { through } = relation;
  return mapValues(state, (entity) => ({
    ...entity,
    [through]: get(entity, through) == foreignEntity.id ? null : get(entity, through),
  }));
}


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
function createReactionsToRelation(relation) {
  if (relation.isMany) {  // relation is going to be an array (e.g. users)
    return createManyRelationReactions(relation);
  }
  else {
    return createOneRelationReactions(relation);
  }
}


export default function createReactions(relations) {
  return relations
    .map(createReactionsToRelation)
    .reduce((memo, reactions) => ({ ...memo, ...reactions }), {});
}
