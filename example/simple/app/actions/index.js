import {
  createEntity,
  updateEntity,
  deleteEntity,
} from '../../../../src/helpers';
import {
  loadEntities,
} from '../../../../src/middleware';
import schemas from '../schemas';


export const LOAD_GROUPS = 'LOAD_GROUPS';
export const LOAD_GROUPS_DONE = 'LOAD_GROUPS_DONE';

export function loadGroups() {
  return loadEntities(schemas.Group, {
    type: LOAD_GROUPS,
  });
}


export const CREATE_GROUP = 'CREATE_GROUP';

export function createGroup(group) {
  return createEntity(schemas.Group, group);
}


export const CHECK_TASK = 'CHECK_TASK';

export function checkTask(task) {
  const id = task.id ? task.id : task;
  return updateEntity(schemas.Task, id, 'payload.data', {
    type: CHECK_TASK,
    payload: {
      data: { done: true },
    },
  });
}


export function uncheckTask(task) {
  const id = task.id ? task.id : task;
  return updateEntity(schemas.Task, id, 'payload.data', {
    type: CHECK_TASK,
    payload: {
      data: { done: false },
    },
  });
}


export const DELETE_TASK = 'DELETE_TASK';

export function deleteTask(task) {
  const id = task.id ? task.id : task;
  return deleteEntity(schemas.Task, id, {
    type: DELETE_TASK,
  });
}


export const CREATE_TASK = 'CREATE_TASK';

export function createTask(task) {
  return createEntity(schemas.Task, 'payload.task', {
    type: CREATE_TASK,
    payload: {
      task,
    },
  });
}


export const CREATE_USER = 'CREATE_USER';

export function createUser(user) {
  return createEntity(schemas.User, 'payload.user', {
    type: CREATE_USER,
    payload: {
      user,
    },
  });
}
