import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import { denormalize } from 'denormalizr';


const values = (obj={}) => Object.values(obj);

const getName = (schema) => (typeof schema === 'string') ? schema : schema.getKey();


export function getEntities(state, schema, ids) {
  if (ids) {
    ids = Array.isArray(ids) ? ids : [ids];
  }
  const name = getName(schema);
  const entities = ids ?
    values(state[name]).filter(e => ids.includes(e.id)) : values(state[name]);
  return entities.map(e => denormalize(e, state, state._originalSchemas[name]));
}


export function getEntitiesBy(state, schema, by={}) {
  const key = Object.keys(by)[0];
  const value = by[key];
  const name = getName(schema);
  const entities = values(pickBy(state[name], e => e[key] === value));
  return entities.map(e => denormalize(e, state, state._originalSchemas[name]));
}


export function getEntity(state, schema, id) {
  if ( ! id) throw new Error('Required param `id` is missing');
  const name = getName(schema);
  const entities = state[name];
  if (isEmpty(entities)) return null;
  const entity = entities[id];
  return denormalize(entity, state, state._originalSchemas[name]);
}
