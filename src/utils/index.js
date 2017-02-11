import cloneDeep from 'lodash/cloneDeep';
import defaultsDeep from 'lodash/defaultsDeep';
import set from 'lodash/set';
import isPlainObject from 'lodash/isPlainObject';


export * from './populate';


export function flatten(obj, parentPath) {
  return Object.keys(obj || {}).reduce((result, k) => {
    if ( ! obj.hasOwnProperty(k)) return result;
    const currentPath = parentPath ? parentPath + '.' + k : k;
    const currentProp = obj[k];

    //if (Array.isArray(currentProp)) {
      //const arrayResult = currentProp.map((value, i) => {
        //const arrayPath = `${currentPath}[${i}]`;
        //if (isPlainObject(value)) return flatten(value, arrayPath);
        //return { [arrayPath] : value };
      //});
      //return Object.assign({}, result, ...arrayResult);
    //}
    if (isPlainObject(currentProp)) {
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


export function defaultTo(obj, defaults) {
  return defaultsDeep(cloneDeep(obj), defaults);
}


export function update(obj, newData) {
  const flattenedData = flatten(newData);
  return Object.keys(flattenedData).reduce((result, k) => {
    return set(result, k, flattenedData[k]);
  }, cloneDeep(obj));
}


export function arrayFrom(value) {
  return Array.isArray(value) ? value : [value];
}
