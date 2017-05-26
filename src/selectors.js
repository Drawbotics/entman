import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import { denormalize } from 'entman-denormalizr';


export function getEntitiesSlice(state) {
  return state.entities;
}


export function getEntities(state, schema, ids, raw) {
  const key = schema.key;
  const entitiesState = getEntitiesSlice(state);
  const entities = ids ?
    values(entitiesState[key]).filter(e => ids.includes(e.id)) : values(entitiesState[key]);

  if (raw) {
    return entities;
  }

  return entities.map(e => denormalize(e, entitiesState, schema));
}


export function getEntitiesBy(state, schema, by={}, raw) {
  const byKey = Object.keys(by)[0];
  const value = by[byKey];
  const key = schema.key;
  const entitiesState = getEntitiesSlice(state);
  const entities = values(pickBy(entitiesState[key], e => e[byKey] === value));

  if (raw) {
    return entities;
  }

  return entities.map(e => denormalize(e, entitiesState, schema));
}


export function getEntity(state, schema, id, raw) {
  if ( ! id) throw new Error('Required param `id` is missing');
  const key = schema.key;
  const entitiesState = getEntitiesSlice(state);
  const entities = entitiesState[key];
  if (isEmpty(entities)) return null;
  const entity = entities[id];

  if (raw) {
    return entity;
  }

  return denormalize(entity, entitiesState, schema);
}
