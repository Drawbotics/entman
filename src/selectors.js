import { denormalize } from './denormalizr';


export function getEntitiesSlice(state) {
  return state.entities;
}


export function getEntities(state, schema, ids, raw) {
  const key = schema.key;
  const entitiesState = getEntitiesSlice(state);
  const allValues = Object.values(entitiesState[key] || {});
  const entities = ids ?
    allValues.filter(e => ids.includes(e.id)) : allValues;

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
  const entities = Object.values(
    Object.fromEntries(
      Object.entries(entitiesState[key] || {}).filter(([, e]) => e[byKey] === value)
    )
  );

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
  if (!entities || Object.keys(entities).length === 0) return null;
  const entity = entities[id];

  if (raw) {
    return entity;
  }

  return denormalize(entity, entitiesState, schema);
}
