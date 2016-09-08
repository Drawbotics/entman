import {
  defineSchema,
  hasMany,
  generateSchemas,
} from '../../../../src/schema';


const group = defineSchema('Group', {
  users: hasMany('User'),
});


const user = defineSchema('User', {
  group: 'Group',
  tasks: hasMany('Task'),
});


const task = defineSchema('Task', {
  user: 'User',
});


export default generateSchemas([group, user, task]);
