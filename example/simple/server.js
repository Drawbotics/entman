const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');

const webpackConfig = require('./webpack.config');
const groups = require('./fixtures');


const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(webpackDevMiddleware(webpack(webpackConfig), {
  stats: { color: true },
  publicPath: '/bundle',
}));


app.get('/api/group', (req, res) => {
  setTimeout(() => {
    res.json(groups);
  }, 2);
})


app.post('/api/group', (req, res) => {
  setTimeout(() => {
    res.send('ok');
  }, 2000);
});


app.post('/api/user', (req, res) => {
  setTimeout(() => {
    if (Math.floor(Math.random() * (5 - 1) + 1) === 1) {
      res.status(500).json({ error: 'Something is broken' });
    }
    else {
      const nextId = groups.reduce((memo, g) => g.users.length + memo, 1);
      const user = Object.assign({ id: nextId }, req.body);
      const groupId = user.group;
      groups.find(g => g.id === groupId).users.push(user);
      res.send(user);
    }
  }, 2000);
});


app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
