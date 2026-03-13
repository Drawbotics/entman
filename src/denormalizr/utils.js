/**
 * Recursively apply object/array access to get the value.
 *
 * @param  {Object} object
 * @param  {Array<string, number>} keyPath
 * @return {Any}
 */
export function getIn(object, keyPath) {
  return keyPath.reduce((memo, key) => memo[key], object);
}

/**
 * Recursively apply object/array access and set the value at that location.
 *
 * @param  {Object} object
 * @param  {Array<string, number>} keyPath
 * @param  {Any} value
 * @return {Any}
 */
export function setIn(object, keyPath, value) {
  const lastKey = keyPath.pop();
  const location = getIn(object, keyPath);

  location[lastKey] = value;

  return object;
}
