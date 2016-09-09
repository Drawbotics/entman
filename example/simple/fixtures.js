const groups = [
  {
    id: 1,
    name: 'Group 1',
    users: [
      {
        id: 1,
        name: 'Lars',
        group: 1,
        tasks: [
          {
            id: 1,
            title: 'Do something',
            done: true,
            user: 1,
          },
          {
            id: 2,
            title: 'Keep doing',
            done: false,
            user: 1,
          },
        ],
      },
      {
        id: 2,
        name: 'Grishan',
        group: 1,
      },
    ] ,
  },
  {
    id: 2,
    name: 'Group 2',
    users: [
      {
        id: 3,
        name: 'Deathvoid',
        group: 2,
      }
    ]
  },
];


module.exports = groups;
