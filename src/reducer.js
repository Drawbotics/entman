import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import cloneDeep from 'lodash/cloneDeep';

import * as EntitiesActions from './actions';
import {
  inverseSchemas,
  getEmptyEntities,
  flatten,
  values,
  defaultsDeep,
  setIn,
  update,
} from './utils';


// Sample relation
const relation = {
  from: 'user',
  to: 'group',
  withId: 1,
  through: 'users',
  isArray: true,
};


const getRelationships = (schema) => {
  return [relation];
};


function updateAfterCreate(state, action) {
  const { schema, data } = action.payload;
  const relationships = getRelationships(schema);
  return relationships.reduce((newState, relationship) => {
    const { from, to, withId, through, isArray } = relationship;
    if (isArray) {
      const value = newState[to][withId][through];
      newState[to][withId][through] = value.concat(data.result);
    }
    else {
      newState[to][withId][through] = data.result;
    }
  }, cloneDeep(state));
}


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


function reducer(state, action) {
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


export default function entities(schemas) {
  const inversedSchemas = inverseSchemas(values(schemas));
  const initialState = {
    _originalSchemas: values(schemas).reduce((result, s) => ({ ...result, [s._key]: s }), {}),
    _schemas: inversedSchemas,
    ...getEmptyEntities(inversedSchemas),
  };
  return (state = initialState, action) => reducer(state, action);
}
