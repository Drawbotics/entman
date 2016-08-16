import { inverseSchema } from './utils';
import { normalize } from 'normalizr';


export const CREATE_ENTITY = 'CREATE_ENTITY';

/**
 * Create would be better named as "add", because
 * we are not creating entities, we are just adding
 * them to the store. But the word "create" is kept
 * because resemblance with CRUD operations.
 */
export function createEntity(schema, data) {
  return {
    type: CREATE_ENTITY,
    payload: {
      name: inverseSchema(schema).name,
      data: normalize(data, schema),
    },
    meta: {
      isEntityAction: true,
    },
  };
}


/**
 * The "READ" operation from CRUD are
 * the selectors that read from the estate.
 */


export const UPDATE_ENTITY = 'UPDATE_ENTITY';

export function updateEntity(schema, id, data, defaulting) {
  return {
    type: UPDATE_ENTITY,
    payload: {
      name: inverseSchema(schema).name,
      id,
      data: normalize({ id, ...data }, schema),
      defaulting,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const DELETE_ENTITY = 'DELETE_ENTITY';

export function deleteEntity(schema, id) {
  return {
    type: DELETE_ENTITY,
    payload: {
      name: inverseSchema(schema).name,
      id,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const UPDATE_ENTITY_ID = 'UPDATE_ENTITY_ID';

export function updateEntityId(schema, oldId, newId) {
  return {
    type: UPDATE_ENTITY_ID,
    payload: {
      name: inverseSchema(schema).name,
      oldId,
      newId,
    },
    meta: {
      isEntityAction: true,
    },
  };
}
