import { schema as Schema } from 'normalizr';
import { getIn, setIn } from './utils';

const EntitySchema = Schema.Entity;
const ArraySchema = Schema.Array;
const UnionSchema = Schema.Union;
const ValuesSchema = Schema.Values;

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isEmpty(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function merge(target, source) {
  if (source == null) return { ...target };
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (isObject(srcVal) && !Array.isArray(srcVal) && isObject(tgtVal) && !Array.isArray(tgtVal)) {
      result[key] = merge(tgtVal, srcVal);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

/**
 * Take either an entity or id and derive the other.
 *
 * @param   {object|number|string} entityOrId
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @returns {object}
 */
function resolveEntityOrId(entityOrId, entities, schema) {
  const key = schema.key;

  let entity = entityOrId;
  let id = entityOrId;

  if (isObject(entityOrId)) {
    id = schema.getId(entity) || getIn(entity, ['id']);
  } else {
    entity = getIn(entities, [key, id]);
  }

  return { entity, id };
}

/**
 * Denormalizes each entity in the given array.
 *
 * @param   {Array} items
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @param   {object} bag
 * @returns {Array}
 */
function denormalizeIterable(items, entities, schema, bag) {
  const isMappable = typeof items.map === 'function';

  const itemSchema = Array.isArray(schema) ? schema[0] : schema.schema;

  // Handle arrayOf iterables
  if (isMappable) {
    return items
      .map(o => denormalize(o, entities, itemSchema, bag))
      .filter(o => ! isEmpty(o));
  }

  // Handle valuesOf iterables
  const denormalized = {};
  Object.keys(items).forEach((key) => {
    denormalized[key] = denormalize(items[key], entities, itemSchema, bag);
  });
  return denormalized;
}

/**
 * @param   {object|number|string} entity
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @param   {object} bag
 * @returns {object}
 */
function denormalizeUnion(entity, entities, schema, bag) {
  const schemaAttribute = getIn(entity, ['schema']);
  const itemSchema = getIn(schema, ['schema', schemaAttribute]);
  if (!itemSchema) return entity;

  const id = itemSchema.getId(entity) || getIn(entity, ['id']);

  return denormalize(
    id,
    entities,
    itemSchema,
    bag,
  );
}

/**
 * Takes an object and denormalizes it.
 *
 * Note: This will mutate the object. This is necessary for handling circular
 * dependencies. In order to not mutate the original object, the caller should
 * copy the object before passing it here.
 *
 * @param   {object} obj
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @param   {object} bag
 * @returns {object}
 */
function denormalizeObject(obj, entities, schema, bag) {
  let denormalized = obj;

  const schemaDefinition = typeof schema.inferSchema === 'function'
    ? schema.inferSchema(obj)
    : (schema.schema || schema)
  ;

  Object.keys(schemaDefinition)
    .filter(attribute => typeof getIn(obj, [attribute]) !== 'undefined')
    .forEach((attribute) => {
      const item = getIn(obj, [attribute]);
      const itemSchema = getIn(schemaDefinition, [attribute]);

      const denormalizedAttribute = denormalize(item, entities, itemSchema, bag);
      if (isEmpty(denormalizedAttribute)) {
        denormalized = setIn(denormalized, [attribute], null);
      }
      else {
        denormalized = setIn(denormalized, [attribute], denormalizedAttribute);
      }
    });

  return denormalized;
}

/**
 * Takes an entity, saves a reference to it in the 'bag' and then denormalizes
 * it. Saving the reference is necessary for circular dependencies.
 *
 * @param   {object|number|string} entityOrId
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @param   {object} bag
 * @returns {object}
 */
function denormalizeEntity(entityOrId, entities, schema, bag) {
  const key = schema.key;
  const { entity, id } = resolveEntityOrId(entityOrId, entities, schema);

  if (!bag.hasOwnProperty(key)) {
    bag[key] = {};
  }

  if (!bag[key].hasOwnProperty(id)) {
    // Ensure we don't mutate the original object
    const obj = merge({}, entity);

    // Need to set this first so that if it is referenced within the call to
    // denormalizeObject, it will already exist.
    bag[key][id] = obj;
    bag[key][id] = denormalizeObject(obj, entities, schema, bag);
 }

  // If schema has a property called `computed` add it to the
  // final denormalized object. This property contains a collection
  // of method to compute data from the final entity.
  if (schema.schema && schema.schema.hasOwnProperty('_computed') && bag[key][id].id) {
    bag[key][id] = Object.assign(bag[key][id], schema.schema._computed);
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
 *
 * @param   {object|array|number|string} obj
 * @param   {object} entities
 * @param   {schema.Entity} schema
 * @param   {object} bag
 * @returns {object|array}
 */
export function denormalize(obj, entities, schema, bag = {}) {
  if (obj === null || typeof obj === 'undefined' || !isObject(schema)) {
    return obj;
  }

  if (schema instanceof EntitySchema || schema.hasOwnProperty('_key')) {
    return denormalizeEntity(obj, entities, schema, bag);
  } else if (
    schema instanceof ValuesSchema ||
    schema instanceof ArraySchema ||
    Array.isArray(schema)
  ) {
    return denormalizeIterable(obj, entities, schema, bag);
  } else if (schema instanceof UnionSchema) {
    return denormalizeUnion(obj, entities, schema, bag);
  }

  // Ensure we don't mutate the original object
  const entity = merge({}, obj);
  return denormalizeObject(entity, entities, schema, bag);
}
