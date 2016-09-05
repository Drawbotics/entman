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
  const relatedEntities = [];
  const schemaDefinition = Object.keys(schema.attributes).reduce((result, a) => {
    const attribute = schema.attributes[a];
    if (typeof attribute === 'function') {
      // Treat it like a computed property
      return { ...result, _computed: { ...result._computed, [a]: attribute } };
    }
    else if (typeof attribute === 'string') {
      // Single reference to another schema
      relatedEntities.push({ prop: a, entity: attribute });
      return { ...result, [a]: bag[attribute] };
    }
    else if (attribute.isArray) {
      // Array reference to another schema
      relatedEntities.push({ prop: a, entity: attribute.relatedSchema });
      return { ...result, [a]: arrayOf(bag[attribute.relatedSchema]) };
    }
    return result;  // Shouldn't never come to here
  }, {});
  const finalSchema = bag[schema.name];
  finalSchema.define(schemaDefinition);
  Object.defineProperty(finalSchema, 'isRelatedTo', {
    enumerable: false,
    value(entityName) {
      return relatedEntities.map(e => e.entity).includes(entityName);
    },
  });
  Object.defineProperty(finalSchema, 'getRelatedThroughTo', {
    enumerable: false,
    value(relatedEntityName) {
      return Object.keys(this).find(k => {
        console.groupCollapsed(this.getKey())
        console.log('this', this);
        console.log('relatedTo', relatedEntityName);
        console.groupEnd(this.getKey());
        if (k.startsWith('_')) return false;
        if (this[k].getKey) {
          return this[k].getKey() === relatedEntityName;
        }
        else if (this[k].getItemSchema) {
          return this[k].getItemSchema().getKey() === relatedEntityName;
        }
        return false;
      });
    }
  });
  Object.defineProperty(finalSchema, 'getRelation', {
    enumerable: false,
    value(entity, relatedEntityName) {
      console.log('entity', entity);
      console.log('relatedEntityName', relatedEntityName);
      const { prop } = relatedEntities.find(e => e.entity === relatedEntityName);
      const relatedId = entity[prop];
      const relatedPropName = bag[relatedEntityName].getRelatedThroughTo(this.getKey());
      return {
        related: relatedEntityName,
        relatedPropName,
        relatedId,
      };
    },
  });
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
