import { v4 } from 'node-uuid';
import { normalize, arrayOf } from 'normalizr';
import isPlainObject from 'lodash/isPlainObject';


export const CREATE_ENTITIES = 'CREATE_ENTITIES';

export function createEntities(schema, data=[]) {
  schema = arrayOf(schema);
  data = data.map(e => {
    if ( ! e.hasOwnProperty('id')) {
      return {
        ...e,
        id: v4(),
      };
    }
    return e;
  });
  return {
    type: CREATE_ENTITIES,
    payload: {
      key: schema.getItemSchema().getKey(),
      schema: schema,
      data: normalize(data, schema),
      _rawData: data,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const CREATE_ENTITY = 'CREATE_ENTITY';

export function createEntity(schema, data) {
  if ( ! data.hasOwnProperty('id')) {
    data = { ...data, id: v4() };
  }
  return {
    type: CREATE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      data: normalize(data, schema),
      _rawData: data,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const UPDATE_ENTITY = 'UPDATE_ENTITY';

export function updateEntity(schema, id, data, useDefault) {
  return {
    type: UPDATE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      id,
      data: normalize({ id, ...data }, schema),
      useDefault,
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
      key: schema.getKey(),
      schema,
      oldId,
      newId,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const DELETE_ENTITY = 'DELETE_ENTITY';

export function deleteEntity(schema, id) {
  if (isPlainObject(id) && id.hasOwnProperty('id')) {
    id = id.id;
  }
  return {
    type: DELETE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      id,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export default {
  createEntity,
  updateEntity,
  deleteEntity,
  updateEntityId,
};
