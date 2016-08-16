import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import cloneDeep from 'lodash/cloneDeep';
import dD from 'lodash/defaultsDeep';
import set from 'lodash/set';
import isPlainObject from 'lodash/isPlainObject';
import IterableSchema from 'normalizr/lib/IterableSchema';
import EntitySchema from 'normalizr/lib/EntitySchema';
import UnionSchema from 'normalizr/lib/UnionSchema';


const isRelationship = (prop) => (prop instanceof EntitySchema) ||
  (prop instanceof IterableSchema) || (prop instanceof UnionSchema);


export function inverseSchema(schema) {
  const result = Object.keys(schema).reduce((result, key) => {
    const prop = schema[key];
    if ( ! isRelationship(prop)) return result;
    const isArray = prop instanceof IterableSchema;
    const entityName = isArray ? prop.getItemSchema().getKey() : prop.getKey();
    return {
      ...result,
      relationships: {
        ...result.relationships,
        [entityName]: { isArray, key, entity: entityName }
      }
    };
  }, { name: schema._key, relationships: {} });
  if (Object.keys(result.relationships).length <= 0) delete result.relationships;
  return result;
}


export function inverseSchemas(schemas) {
  const inversedSchemas = map(schemas, inverseSchema);
  return inversedSchemas.reduce((result, s) => {
    result[s.name] = s;
    return result;
  }, {});
}


export function getEmptyEntities(inversedSchemas={}) {
  return mapValues(inversedSchemas, s => ({}));
}


export function flatten(obj, parentPath) {
  return Object.keys(obj || {}).reduce((result, k) => {
    if ( ! obj.hasOwnProperty(k)) return result;
    const currentPath = parentPath ? parentPath + '.' + k : k;
    const currentProp = obj[k];

    if (Array.isArray(currentProp)) {
      const arrayResult = currentProp.map((value, i) => {
        const arrayPath = `${currentPath}[${i}]`;
        if (isPlainObject(value)) return flatten(value, arrayPath);
        return { [arrayPath] : value };
      });
      return Object.assign({}, result, ...arrayResult);
    }
    else if (isPlainObject(currentProp)) {
      return {
        ...result,
        ...flatten(currentProp, currentPath),
      };
    }

    return {
      ...result,
      [currentPath]: currentProp,
    };
  }, {});
}


export function values(obj={}) {
  return Object.values(obj);
}


export function defaultsDeep(obj, defaults) {
  return dD(cloneDeep(obj), defaults);
}


export function setIn(obj, field, value) {
  const result = cloneDeep(obj);
  set(result, field, value);
  return result;
};


export function update(obj, data) {
  const flattenedData = flatten(data);
  return Object.keys(flattenedData).reduce((result, k) => {
    return setIn(result, k, flattenedData[k]);
  }, obj);
};


export function mergeEntities(state={}, action, name) {
  const { result } = action.payload;
  return { ...state, ...result.entities[name] };
}
