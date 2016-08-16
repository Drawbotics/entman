const path = require('path');
const webpack = require('webpack');


const jsDirs = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'test'),
];


module.exports = {
  resolve: {
    root: jsDirs,
    extensions: ['', '.js'],
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/',
    filename: 'entities-manager.js',
  },
  module: {
    preLoaders: [{
      test: /\.jsx?$/,
      include: jsDirs,
      loaders: [ 'eslint' ]
    }],
    loaders: [{
      test: /\.jsx?$/,
      include: jsDirs,
      loaders: [ 'babel?presets[]=es2015&presets[]=stage-0' ],
    }]
  },
};
