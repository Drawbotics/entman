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
}


function deleteEntities(state, action) {
}


function reducer(state, action) {
  if ( ! get(action, 'meta.entmanAction', false)) return state;
  switch (action.meta.type) {
    case EntitiesActions.CREATE_ENTITIES:
    case EntitiesActions.CREATE_ENTITY: {
      const { entities } = action.payload.data;
      return mapValues(state, (currentEntities, key) => ({
        ...currentEntities,
        ...entities[key],
      }));
    }
    case EntitiesActions.UPDATE_ENTITY: {
      const { data, id, key, useDefault } = action.payload;
      const newData = data.entities[key][id];
      delete newData.id;
      return {
        ...state,
        [key]: {
          ...state[key],
          [id]: useDefault ? defaultTo(state[key][id], newData) : update(state[key][id], newData),
        },
      };
    }
    case EntitiesActions.UPDATE_ENTITIES: {
      const { data, ids, key } = action.payload;
      return ids.reduce((memo, id) => {
        const newData = data.entities[key][id];
        delete newData.id;
        return {
          ...memo,
          [key]: {
            ...memo[key],
            [id]: update(memo[key][id], newData),
          },
        };
      }, state);
    }
    case EntitiesActions.UPDATE_ENTITY_ID: {
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
    }
    case EntitiesActions.DELETE_ENTITY: {
      const { key, id } = action.payload;
      return {
        ...state,
        [key]: omit(state[key], id),
      };
    }
    default:
      return state;
  }
}


function createReducer(entities) {
  const reactions = Object.keys(entities).reduce((memo, k) => ({
    ...memo,
    [`@@entman/CREATE_ENTITIES_${k.toUpperCase()}`]: (state, action) => ({
      ...state, [k]: { ...state[k], ...createEntities(state[k], action) },
    }),
    [`@@entman/UPDATE_ENTITIES_${k.toUpperCase()}`]: (state, action) => ({
      ...state, [k]: { ...state[k], ...updateEntities(state[k], action) },
    }),
  }), {});
  return (state, action) => {
    const reaction = reactions[action.type];
    return (typeof reaction === 'function') ? reaction(state, action) : state;
  };
}


export default function entities(schemas) {
  if (isEmpty(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  const emptyEntities = mapValues(schemas, () => ({}));
  return (state=emptyEntities, action) => createReducer(emptyEntities)(state, action);
}
