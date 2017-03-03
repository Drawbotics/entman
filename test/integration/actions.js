import {
  createEntities,
  updateEntities,
  updateEntityId,
  deleteEntities,
} from '../../lib';
import schemas from './schemas';


export function receiveGroups(groups) {
  return createEntities(schemas.Group, 'payload.groups', {
    type: 'RECEIVE_GROUPS',
    payload: { groups },
  });
}


export function createGroup(group) {
  return createEntities(schemas.Group, 'payload.group', {
    type: 'CREATE_GROUP',
    payload: { group },
  });
}


export function createUser(user) {
  return createEntities(schemas.User, 'payload.user', {
    type: 'CREATE_USER',
    payload: { user },
  });
}


export function createTask(task) {
  return createEntities(schemas.Task, 'payload.task', {
    type: 'CREATE_TASK',
    payload: { task },
  });
}


export function updateGroup(id, data) {
  return updateEntities(schemas.Group, id, 'payload.data', {
    type: 'UPDATE_GROUP',
    payload: { data },
  });
}


export function updateUser(id, data) {
  return updateEntities(schemas.User, id, 'payload.data', {
    type: 'UPDATE_USER',
    payload: { data },
  });
}


export function updateTask(id, data) {
  return updateEntities(schemas.Task, id, 'payload.data', {
    type: 'UPDATE_TASK',
    payload: { data },
  });
}


export function deleteGroup(id) {
  return deleteEntities(schemas.Group, id, {
    type: 'DELETE_GROUP',
  });
}


export function deleteUser(id) {
  return deleteEntities(schemas.User, id, {
    type: 'DELETE_USER',
  });
}


export function updateUserId(oldId, newId) {
  return updateEntityId(schemas.User, oldId, newId, {
    type: 'UPDATE_USER_ID',
  });
}


export function updateGroupId(oldId, newId) {
  return updateEntityId(schemas.Group, oldId, newId, {
    type: 'UPDATE_GROUP_ID',
  });
}
