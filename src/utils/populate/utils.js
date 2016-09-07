import get from 'lodash/get';
import set from 'lodash/set';


export function setIn(obj, path, value) {
  if (obj.setIn) {
    // return object.setIn(stringifiedArray(keyPath), value)
    throw new Error('Not implemented');
  }
  set(obj, path, value);
  return obj;
}


export function getIn(obj, path) {
  if (obj.getIn) {
    // return object.getIn(stringifiedArray(keyPath))
    throw new Error('Not implemented');
  }

  return get(obj, path);
}


export function isImmutable(obj) {
  return false;
}
