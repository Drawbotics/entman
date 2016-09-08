import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';

import { populate } from './utils';


export function getEntities(state, schema, ids) {
  const key = schema.getKey();
  const entities = ids ?
    values(state[key]).filter(e => ids.includes(e.id)) : values(state[key]);
  return entities.map(e => populate(schema, e, state));
}


export function getEntitiesBy(state, schema, by={}) {
  const byKey = Object.keys(by)[0];
  const value = by[byKey];
  const key = schema.getKey();
  const entities = values(pickBy(state[key], e => e[byKey] === value));
  return entities.map(e => populate(schema, e, state));
}


export function getEntity(state, schema, id) {
  if ( ! id) throw new Error('Required param `id` is missing');
  const key = schema.getKey();
  const entities = state[key];
  if (isEmpty(entities)) return null;
  const entity = entities[id];
  return populate(schema, entity, state);
}
