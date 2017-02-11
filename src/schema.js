import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { Schema, arrayOf } from 'normalizr';


function getRelatedThrough(entity1, entity2) {
  return Object.keys(entity1).find(prop => {
    if (prop.startsWith('_')) {
      return false;
    }
    const relation = entity1[prop];
    if (relation.getKey) {
      return relation.getKey() === entity2.getKey();
    }
    else if (relation.getItemSchema) {
      return relation.getItemSchema().getKey() === entity2.getKey();
    }
    return false;
  });
}


function createSchemaDefinition(config, bag) {
  const definition = Object.keys(config.attributes).reduce((memo, a) => {
    const attribute = config.attributes[a];
    if (typeof attribute === 'function') { // Treat it like a computed property
      return { ...memo, _computed: { ...memo._computed, [a]: attribute } };
    }
    else if (typeof attribute === 'string') { // Single reference to another schema
      return { ...memo, [a]: bag[attribute] };
    }
    else if (attribute.isArray) { // Array reference to another schema
      return { ...memo, [a]: arrayOf(bag[attribute.relatedSchema]) };
    }
    return memo;  // Should never come to here
  }, {});
  return { ...definition, ...omit(config, 'attributes') };
}


function extractRelatedEntities(attributes) {
  return Object.keys(attributes).reduce((memo, a) => {
    const attribute = attributes[a];
    if (typeof attribute === 'string') { // Single reference to another schema
      return [ ...memo, { prop: a, entity: attribute, isArray: false } ];
    }
    else if (attribute.isArray) { // Array reference to another schema
      return [ ...memo, { prop: a, entity: attribute.relatedSchema, isArray: true } ];
    }
    return memo;
  }, []);
}


function getRelations(schema, relatedEntities, bag) {
  return () => relatedEntities.map((relatedEntity) => ({
    to: relatedEntity.entity,
    through: relatedEntity.prop,
    foreign: getRelatedThrough(bag[relatedEntity.entity], schema),
    isMany: relatedEntity.isArray,
  }));
}


function generateSchema(schema, bag) {
  const finalSchema = bag[schema.name];
  finalSchema.define(createSchemaDefinition(schema.config, bag));

  Object.defineProperty(finalSchema, 'getRelations', {
    enumerable: false,
    value: getRelations(finalSchema, extractRelatedEntities(schema.config.attributes), bag),
  });

  return finalSchema;
}



export function defineSchema(name, config={}) {
  if (isEmpty(name)) {
    throw new Error('[INVALID NAME]');
  }
  if ((typeof config !== 'object') && config) {
    throw new Error('[INVALID CONFIG]');
  }
  return {
    name,
    config: { ...config, attributes: config.attributes ? config.attributes : {}},
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
