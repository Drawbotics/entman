import { defineSchema, hasMany, generateSchemas } from '../../lib';


const Group = defineSchema('Group', {
  attributes: {
    users: hasMany('User'),

    getNumberOfUsers() {
      return this.users.length;
    },
  },
});


const User = defineSchema('User', {
  attributes: {
    group: 'Group',
    tasks: hasMany('Task'),
  },
});


const Task = defineSchema('Task', {
  attributes: {
    users: hasMany('User'),
  },
});


export default generateSchemas([ Group, User, Task ]);
