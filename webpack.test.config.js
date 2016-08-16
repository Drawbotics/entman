const path = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');


const plugins = webpackBaseConfig.plugins || [];


module.exports = Object.assign({}, webpackBaseConfig, {
  devtool: 'inline-source-map',
  entry: {},
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      'process.env': { TESTING: '"true"' }
    }),
  ],
});
