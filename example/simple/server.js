const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const webpackConfig = require('./webpack.config');


const app = express();


app.use(webpackDevMiddleware(webpack(webpackConfig), {
  stats: { color: true },
  publicPath: '/bundle',
}));


app.get('/api/group', (req, res) => {
  setTimeout(() => {
    res.json([
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
    ]);
  }, 2000);
})


app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
