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
    relatedSchema: schema.hasOwnProperty('name') ? schema.name : schema,
    isArray: true,
  };
}


function generateSchema(schema, bag) {
  const schemaDefinition = Object.keys(schema.attributes).reduce((result, a) => {
    const attribute = schema.attributes[a];
    if (typeof attribute === 'function') {
      // Treat it like a computed property
      return { ...result, _computed: { ...result._computed, [a]: attribute } };
    }
    else if (typeof attribute === 'string') {
      // Single reference to another schema
      return { ...result, [a]: bag[attribute] };
    }
    else if (attribute.isArray) {
      // Array reference to another schema
      return { ...result, [a]: arrayOf(bag[attribute.relatedSchema]) };
    }
    return result;  // Shouldn't never come to here
  }, {});
  const finalSchema = bag[schema.name];
  finalSchema.define(schemaDefinition);
  return finalSchema;
}


export function generateSchemas(schemas) {
  if (isEmpty(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  if ( ! Array.isArray(schemas)) {
    throw new Error('[INVALID SCHEMAS]');
  }
  const schemasBag = schemas.reduce((bag, s) => ({
    ...bag,
    [s.name]: new Schema(s.name),
  }), {});
  return schemas.reduce((result, s) => ({
    ...result,
    [s.name]: generateSchema(s, schemasBag),
  }), {});
}
