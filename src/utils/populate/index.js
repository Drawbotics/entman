/**
 * Code highly inspired by https://github.com/gpbl/denormalizr
 */

import isObject from 'lodash/isObject';
import get from 'lodash/get';
import set from 'lodash/set';
import values from 'lodash/values';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { schema } from 'normalizr';


const IterableSchema = schema.Array;
const EntitySchema = schema.Values;
const UnionSchema = schema.Union;


/**
 * Take either an entity or id and derive the other.
 *
 * @param   {object|Immutable.Map|number|string} entityOrId
 * @param   {object|Immutable.Map} entities
 * @param   {schema.Entity} schema
 * @returns {object}
 */
function resolveEntityOrId(schema, entityOrId, entities) {
  const key = schema.getKey();

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

  Object.keys(schema)
    .filter(attribute => attribute.substring(0, 1) !== '_')
    .forEach(attribute => {
      const relatedSchema = get(schema, [attribute]);
      if (relatedSchema instanceof IterableSchema) {
        const objId = obj[schema.getIdAttribute()];
        const itemSchema = relatedSchema.getItemSchema();
        const key = itemSchema.getKey();
        const relatedAttribute = getRelatedAttribute(itemSchema, schema);
        const items = values(entities[key])
          .filter(e => e[relatedAttribute] === objId)
          .map(e => e[itemSchema.getIdAttribute()]);
        if (isEmpty(items)) {
          populated = set(populated, [attribute], []);
        }
        else {
          populated = set(populated, [attribute], populate(relatedSchema, items, entities, bag));
        }
      }
      else {
        const item = get(obj, [attribute]);
        populated = set(populated, [attribute], populate(relatedSchema, item, entities, bag));
      }
    });

  return populated;
}


function populateEntity(schema, entityOrId, entities, bag) {
  const key = schema.getKey();
  let { entity, id } = resolveEntityOrId(schema, entityOrId, entities);

  if( ! bag.hasOwnProperty(key)) {
    bag[key] = {};
  }

  if( ! bag[key].hasOwnProperty(id)) {
    // Need to set this first so that if it is referenced within the call to
    // populateObject, it will already exist.
    entity = cloneDeep(entity || { id });
    bag[key][id] = entity;
    bag[key][id] = populateObject(schema, entity, entities, bag);
  }

  // If schema has a property called `computed` add it to the
  // final populated object. This property contains a collection
  // of method to compute data from the final entity.
  if (schema.hasOwnProperty('_computed')) {
    bag[key][id] = Object.assign(bag[key][id], schema._computed);
  }

  return bag[key][id];
}


export function populate(schema, entity, entities, bag={}) {
  if (entity === null || typeof entity === 'undefined' || !isObject(schema)) {
    return entity;
  }

  if (schema instanceof EntitySchema) {
    return populateEntity(schema, entity, entities, bag);
  } else if (schema instanceof IterableSchema) {
    return populateIterable(schema, entity, entities, bag);
  } else if (schema instanceof UnionSchema) {
    return populateUnion(schema, entity, entities, bag);
  } else {
    entity = cloneDeep(entity);
    return populateObject(schema, entity, entities, bag);
  }
}
