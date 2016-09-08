const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const webpackConfig = require('./webpack.config');


const app = express();


app.use(webpackDevMiddleware(webpack(webpackConfig), {
  stats: { color: true },
  publicPath: '/bundle',
}));


app.get('/', (req, res) => {
  res.send('IT WORKS!');
});


app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
