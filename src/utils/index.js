function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}


function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}


function defaultsDeep(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (result[key] === undefined) {
      result[key] = isPlainObject(source[key]) ? cloneDeep(source[key]) : source[key];
    } else if (isPlainObject(result[key]) && isPlainObject(source[key])) {
      result[key] = defaultsDeep(result[key], source[key]);
    }
  }
  return result;
}


function set(obj, path, value) {
  if (typeof path === 'string') {
    path = path.split('.');
  }
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined || current[path[i]] === null) {
      current[path[i]] = {};
    }
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return obj;
}


export function flatten(obj, parentPath) {
  return Object.keys(obj || {}).reduce((result, k) => {
    if ( ! obj.hasOwnProperty(k)) return result;
    const currentPath = parentPath ? parentPath + '.' + k : k;
    const currentProp = obj[k];

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


export function update(obj={}, newData) {
  const flattenedData = flatten(newData);
  return Object.keys(flattenedData).reduce((result, k) => {
    if (flattenedData[k] === undefined) {
      return result;
    }
    return set(result, k, flattenedData[k]);
  }, cloneDeep(obj));
}


export function arrayFrom(value) {
  return Array.isArray(value) ? value : [value];
}


export function log(value) {
  console.log(value);
  return value;
}
