const path = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');


module.exports = Object.assign({}, webpackBaseConfig, {
  devtool: 'inline-source-map',
  plugins: [
    ...webpackBaseConfig.plugins,
  ],
});
