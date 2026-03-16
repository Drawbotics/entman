import { schema } from 'normalizr';
import { Reducer, Middleware, Action } from 'redux';

// Schema

export interface SchemaDefinition {
  name: string;
  config: {
    attributes: Record<string, any>;
    options: Record<string, any>;
  };
}

export interface HasManyRelation {
  relatedSchema: string;
  isArray: true;
}

export function defineSchema(name: string, config?: {
  attributes?: Record<string, string | HasManyRelation | ((...args: any[]) => any)>;
  options?: Record<string, any>;
}): SchemaDefinition;

export function hasMany(schema: string | SchemaDefinition): HasManyRelation;

export function generateSchemas(
  schemas: SchemaDefinition[],
): Record<string, schema.Entity>;

// Helpers

export interface EntmanAction extends Action {
  meta?: Record<string, any>;
  [key: string]: any;
}

export function createEntities(
  schema: schema.Entity,
  dataPath: string,
  action: EntmanAction,
): EntmanAction;

export function updateEntities(
  schema: schema.Entity,
  ids: string | string[],
  dataPath: string,
  action: EntmanAction,
  useDefault?: boolean,
): EntmanAction;

export function updateEntityId(
  schema: schema.Entity,
  oldId: string,
  newId: string,
  action: EntmanAction,
): EntmanAction;

export function deleteEntities(
  schema: schema.Entity,
  ids: string | string[],
  action: EntmanAction,
): EntmanAction;

// Selectors

export interface EntmanState {
  entities: Record<string, Record<string, any>>;
  [key: string]: any;
}

export function getEntity<T = any>(
  state: EntmanState,
  schema: schema.Entity,
  id: string,
  raw?: boolean,
): T | null;

export function getEntities<T = any>(
  state: EntmanState,
  schema: schema.Entity,
  ids?: string[],
  raw?: boolean,
): T[];

export function getEntitiesBy<T = any>(
  state: EntmanState,
  schema: schema.Entity,
  by?: Record<string, any>,
  raw?: boolean,
): T[];

// Reducer

export function reducer(
  schemas: Record<string, schema.Entity>,
  initialState?: Record<string, Record<string, any>>,
): Reducer;

// Middleware

export function middleware(config?: {
  enableBatching?: boolean;
}): Middleware;
