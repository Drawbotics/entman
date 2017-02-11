/**
 * Code highly inspired by https://github.com/gpbl/denormalizr
 */

import isObject from 'lodash/isObject';
import get from 'lodash/get';
import set from 'lodash/set';
import values from 'lodash/values';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { schema as Schema } from 'normalizr';

const IterableSchema = Schema.Array;
const ValuesSchema = Schema.Values;
const EntitySchema = Schema.Values;
const UnionSchema = Schema.Union;


/**
 * Take either an entity or id and derive the other.
 */
function resolveEntityOrId(schema, entityOrId, entities) {
  const key = schema.key;

  let entity = entityOrId;
  let id = entityOrId;

  if (isObject(entityOrId)) {
    id = get(entity, [schema.getIdAttribute()]);
    id = schema.getId(entity);
  } else {
    entity = get(entities, [key, id]);
  }

  return { entity, id };
}


function getRelatedAttribute(schema1, schema2) {
  return Object.keys(schema1).find(k => {
    if (schema1[k] instanceof IterableSchema) {
      const relatedSchema = schema1[k].getItemSchema();
      return relatedSchema.getKey() === schema2.getKey();
    }
    else if (schema1[k] instanceof EntitySchema) {
      const relatedSchema = schema1[k];
      return relatedSchema.getKey() === schema2.getKey();
    }
    else {
      return false;
    }
  });
}


function populateIterable(schema, items, entities, bag) {
  const itemSchema = schema.getItemSchema();
  return items.map(o => populate(itemSchema, o, entities, bag));
}


function populateUnion(schema, entity, entities, bag) {
  const itemSchema = schema.getItemSchema();
  return populate(
    Object.assign({}, entity, { [entity.schema]: entity.id }),
    entities,
    itemSchema,
    bag,
  )[entity.schema];
}


function populateObject(schema, obj, entities, bag) {
  let populated = obj;

  const schemaDefinition = typeof schema.inferSchema === 'function' ?
    schema.inferSchema(obj) : (schema.schema || schema);

  Object.keys(schema)
    //.filter(attribute => attribute.substring(0, 1) !== '_')
    .filter((attribute) => typeof get(obj, attribute) !== undefined)
    .forEach(attribute => {
      const item = get(obj, attribute);
      const itemSchema = get(schemaDefinition, attribute);

      populated = set(populated, attribute, populate(itemSchema, item, entities, bag));
    });

  return populated;
}


/**
 * Takes an entity, saves a reference to it in the 'bag' and then denormalizes
 * it. Saving the reference is necessary for circular dependencies.
 */
function populateEntity(schema, entityOrId, entities, bag) {
  const key = schema.key;
  const { entity, id } = resolveEntityOrId(schema, entityOrId, entities);

  if( ! bag.hasOwnProperty(key)) {
    bag[key] = {};
  }

  if( ! bag[key].hasOwnProperty(id)) {
    // Need to set this first so that if it is referenced within the call to
    // populateObject, it will already exist.
    const cloned = cloneDeep(entity || { id });
    bag[key][id] = cloned;
    bag[key][id] = populateObject(schema, cloned, entities, bag);
  }

  // If schema has a property called `computed` add it to the
  // final populated object. This property contains a collection
  // of method to compute data from the final entity.
  if (schema.hasOwnProperty('_computed')) {
    bag[key][id] = Object.assign(bag[key][id], schema._computed);
  }

  return bag[key][id];
}


/**
 * Takes an object, array, or id and returns a denormalized copy of it. For
 * an object or array, the same data type is returned. For an id, an object
 * will be returned.
 *
 * If the passed object is null or undefined or if no schema is provided, the
 * passed object will be returned.
 */
export function populate(schema, entity, entities, bag={}) {
  if (entity === null || typeof entity === 'undefined' || !isObject(schema)) {
    return entity;
  }

  if (schema instanceof EntitySchema) {
    return populateEntity(schema, entity, entities, bag);
  } else if (schema instanceof IterableSchema || schema instanceof ValuesSchema || Array.isArray(schema)) {
    return populateIterable(schema, entity, entities, bag);
  } else if (schema instanceof UnionSchema) {
    return populateUnion(schema, entity, entities, bag);
  } else {
    entity = cloneDeep(entity);
    return populateObject(schema, entity, entities, bag);
  }
}
