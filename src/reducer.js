import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';

import * as EntitiesActions from './actions';
import {
  update,
  defaultTo,
} from './utils';


function reducer(state, action) {
  switch (action.type) {
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
      return {
        ...state,
        [key]: {
          ...state[key],
          [id]: useDefault ? defaultTo(state[key][id], newData) : update(state[key][id], newData),
        },
      };
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


export default function entities(schemas) {
  if (isEmpty(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  const emptyEntities = mapValues(schemas, () => ({}));
  return (state=emptyEntities, action) => reducer(state, action);
}
