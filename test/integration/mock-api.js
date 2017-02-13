let groups, users, tasks;


users = () => [
  {
    id: 1,
    name: 'Lars',
    group: 1,
    tasks: [ tasks()[0], tasks()[1] ],
  },
  {
    id: 2,
    name: 'Grishan',
    group: 1,
    tasks: [ tasks()[2] ],
  },
  {
    id: 3,
    name: 'Lars',
    group: 2,
    tasks: [ tasks()[3] ],
  },
  {
    id: 4,
    name: 'Grishan',
    group: 2,
    tasks: [ tasks()[4] ],
  },
];


groups = () => [
  {
    id: 1,
    name: 'Test Group',
    users: [ users()[0], users()[1] ],
  },
  {
    id: 2,
    name: 'Test Group 2',
    users: [ users()[2], users()[3] ],
  },
];


tasks = () => [
  {
    id: 1,
    name: 'Task 1',
    users: [ 1 ],
  },
  {
    id: 2,
    name: 'Task 2',
    users: [ 1 ],
  },
  {
    id: 3,
    name: 'Task 3',
    users: [ 2 ],
  },
  {
    id: 4,
    name: 'Task 4',
    users: [ 3 ],
  },
  {
    id: 5,
    name: 'Task 5',
    users: [ 4 ],
  },
];


export default {
  groups: {
    findAll() {
      return groups();
    },
    find(id) {
      return groups().find((x) => x.id == id);
    },
  },
  users: {
    findAll() {
      return users();
    },
    find(id) {
      return users().find((x) => x.id == id);
    },
  },
  tasks: {
    findAll() {
      return tasks();
    },
    find(id) {
      return tasks().find((x) => x.id == id);
    },
  },
};
