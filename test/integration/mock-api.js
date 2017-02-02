let groups, users, tasks;


users = () => [
  {
    id: 1,
    name: 'Lars',
    group: 1,
    tasks: [1, 2],
  },
  {
    id: 2,
    name: 'Grishan',
    group: 1,
    tasks: [3],
  },
  {
    id: 1,
    name: 'Lars',
    group: 2,
    tasks: [4],
  },
  {
    id: 2,
    name: 'Grishan',
    group: 2,
    tasks: [5],
  },
];


groups = () => [
  {
    id: 1,
    name: 'Test Group',
    users: [ users()[1], users()[2] ],
  }
];


tasks = () => [
  {
    id: 1,
    name: 'Task 1',
  },
  {
    id: 2,
    name: 'Task 2',
  },
  {
    id: 3,
    name: 'Task 3',
  },
  {
    id: 4,
    name: 'Task 4',
  },
  {
    id: 5,
    name: 'Task 5',
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
