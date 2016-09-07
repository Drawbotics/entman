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


function update(entity, newData) {
  const flattenedData = flatten(newData);
  return Object.keys(flattenedData).reduce((result, k) => {
    return set(result, k, flattenedData[k]);
  }, cloneDeep(entity));
}


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
      const { data, id, key } = action.payload;
      const newData = data.entities[key][id];
      return {
        ...state,
        [key]: {
          ...state[key],
          [id]: update(state[key][id], newData),
        },
      };
    }
    case EntitiesActions.UPDATE_ENTITY_ID: {
      const { key, oldId, newId } = action.payload;
      return state;
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
