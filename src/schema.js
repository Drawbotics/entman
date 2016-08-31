import isEmpty from 'lodash/isEmpty';
import { Schema, arrayOf } from 'normalizr';


export function defineSchema(name, attributes={}) {
  if (isEmpty(name)) {
    throw new Error('[INVALID NAME]');
  }
  if ((typeof attributes !== 'object') && attributes) {
    throw new Error('[INVALID ATTRIBUTES]');
  }
  return {
    name,
    attributes,
  };
}


export function hasMany(schema) {
  if (isEmpty(schema)) {
    throw new Error('[INVALID SCHEMA]');
  }
  if (typeof schema !== 'string' && ! schema.hasOwnProperty('name')) {
    throw new Error('[INVALID SCHEMA]');
  }
  return {
    relatedEntity: schema.hasOwnProperty('name') ? schema.name : schema,
    isArray: true,
  };
}


export function generateSchemas() {
}
