import {
  createEntity,
} from '../../../src/helpers';
import { Group } from './schemas';


export const CREATE_GROUP = 'CREATE_GROUP';

export function createGroup(group) {
  return createEntity(Group, group);
}
