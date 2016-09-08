const path = require('path');
const webpack = require('webpack');


module.exports = {
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  entry: './app/app.jsx',
  output: {
    path: path.resolve('./bundle'),
    publicPath: '/bundle',
    filename: 'example.bundle.js',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: [ 'babel?presets[]=es2015&presets[]=stage-0&presets[]=react' ],
    }]
  },
};
