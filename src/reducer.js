import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import * as EntitiesActions from './actions';
import {
  flatten,
  defaultsDeep,
} from './utils';


const updateRelationship = (state, action) => {
  const { name, data, id, newId, oldId } = action.payload;
  const entitySchema = state._schemas[name];
  return Object.keys(entitySchema.relationships).reduce((newState, k) => {
    const relatedSchema = state._schemas[k];
    if ( ! relatedSchema.relationships) return newState;
    const relation = relatedSchema.relationships[name];
    if ( ! relation.isArray) return newState;
    if (EntitiesActions.CREATE_ENTITY === action.type) {
      const { entities } = data;
      const result = Array.isArray(data.result) ? data.result : [data.result];
      result.map(id => entities[name][id]).map(entity => {
        const relatedEntityId = entity[relatedSchema.name];
        const relatedEntity = newState[relatedSchema.name][relatedEntityId];
        if ( ! relatedEntity) return;
        newState[k][entity[k]][relation.key] = relatedEntity[relation.key].concat(...result);
      });
    }
    else if (EntitiesActions.DELETE_ENTITY === action.type) {
      const entity = newState[name][id];
      const relatedEntityId = entity[relatedSchema.name];
      const relatedEntity = newState[relatedSchema.name][relatedEntityId];
      newState[k][entity[k]][relation.key] = relatedEntity[relation.key].filter(i => i !== id);
    }
    else if (EntitiesActions.UPDATE_ENTITY_ID === action.type) {
      const entity = newState[name][newId];
      const relatedEntityId = entity[relatedSchema.name];
      const relatedEntity = newState[relatedSchema.name][relatedEntityId];
      if ( ! relatedEntity) return;
      newState[k][entity[k]][relation.key] = relatedEntity[relation.key].filter(i => i !== oldId);
      newState[k][entity[k]][relation.key] = relatedEntity[relation.key].concat(newId);
    }
    return newState;
  }, cloneDeep(state));
};


function reducer_old(state, action) {
  switch (action.type) {
    case EntitiesActions.CREATE_ENTITY: {
      const { name, data } = action.payload;
      const stateWithEntities = mapValues(state, (v, k) => ({
        ...state[k],
        ...data.entities[k],
      }));
      return updateRelationship(stateWithEntities, action);
    }
    case EntitiesActions.UPDATE_ENTITY: {
      const { name, id, data, defaulting } = action.payload;
      const entity = data.entities[name][id];
      if (defaulting) {
        return {
          ...state,
          [name]: {
            ...state[name],
            [id]: defaultsDeep(state[name][id], entity),
          },
        };
      }
      return {
        ...state,
        [name]: {
          ...state[name],
          [id]: update(state[name][id], entity),
        },
      };
    }
    case EntitiesActions.UPDATE_ENTITY_ID: {
      const { name, newId, oldId } = action.payload;
      const updatedState = {
        ...state,
        [name]: omit({
          ...state[name],
          [newId]: { ...state[name][oldId], id: newId },
        }, oldId)
      };
      return updateRelationship(updatedState, action);
    }
    case EntitiesActions.DELETE_ENTITY: {
      const { name, id } = action.payload;
      const newState = updateRelationship(state, action);
      return {
        ...newState,
        [name]: omit(newState[name], id),
      };
    }
    default:
      return state;
  }
}


function pushIn(entities, id, prop, value) {
  return {
    ...entities,
    [id]: {
      ...entities[id],
      [prop]: [ ...(entities[id][prop] || []), value ],
    },
  };
}


function deleteIn(entities, id, prop, value) {
  return {
    ...entities,
    [id]: {
      ...entities[id],
      [prop]: entities[id][prop].filter(id => id !== value),
    },
  };
}


function setIn(entities, id, prop, value) {
  return {
    ...entities,
    [id]: {
      ...entities[id],
      [prop]: value,
    },
  };
}


function update(state, entityName, id, newData) {
  const flattenedData = flatten(newData);
  return {
    ...state,
    [entityName]: {
      ...state[entityName],
      [id]: Object.keys(flattenedData).reduce((result, k) => {
        return set(result, k, flattenedData[k]);
      }, cloneDeep(state[entityName])),
    },
  };
}


function reducer(state, action) {
  switch (action.type) {
    case EntitiesActions.CREATE_ENTITY: {
      const { schema, data } = action.payload;
      const { entities, result } = data;
      const createdEntity = entities[schema.getKey()][result];
      return mapValues(state, (currentEntities, name) => {
        const mergedEntities = { ...currentEntities, ...entities[name] };
        if (name.startsWith('_') || ! schema.isRelatedTo(name)) {
          return mergedEntities;
        }
        const { relatedPropName, relatedId } = schema.getRelation(createdEntity, name);
        // Only update related arrays?
        if ( ! relatedId) {
          return mergedEntities;
        }
        return pushIn(mergedEntities, relatedId, relatedPropName, createdEntity.id);
      });
    }
    case EntitiesActions.UPDATE_ENTITY: {
      const { schema, data, id, useDefault } = action.payload;
      const newData = data.entities[schema.getKey()][id];
      if (useDefault) {
        return state;
      }
      return update(state, schema.getKey(), id, newData);
    }
    case EntitiesActions.DELETE_ENTITY: {
      const { schema, id } = action.payload;
      const entityToDelete = state[schema.getKey()][id];
      const stateWithoutEntity = {
        ...state,
        [schema.getKey()]: omit(state[schema.getKey()], id),
      };
      return mapValues(stateWithoutEntity, (currentEntities, name) => {
        if (name.startsWith('_') || ! schema.isRelatedTo(name)) {
          return currentEntities;
        }
        const { relatedPropName, relatedId, isArray } = schema.getRelation(entityToDelete, name);
        if (isArray) {
          return deleteIn(currentEntities, relatedId, relatedPropName, entityToDelete.id);
        }
        else {
          return setIn(currentEntities, relatedId, relatedPropName, null);
        }
      });
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
  const initialState = { ...emptyEntities, _schemas: schemas };
  return (state=initialState, action) => reducer(state, action);
}
