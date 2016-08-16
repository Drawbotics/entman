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


export default function entities(schemas) {
  const inversedSchemas = inverseSchemas(values(schemas));
  const initialState = {
    _originalSchemas: values(schemas).reduce((result, s) => ({ ...result, [s._key]: s }), {}),
    _schemas: inversedSchemas,
    ...getEmptyEntities(inversedSchemas),
  };
  // TODO: Create an entity reducer by entity and compose them
  // into a entities reducer
  return (state = initialState, action) => {
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
  };
}
