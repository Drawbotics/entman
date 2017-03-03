const webpack = require('webpack');

const webpackBaseConfig = require('./webpack.base.config.js');


module.exports = Object.assign({}, webpackBaseConfig, {
  devtool: 'cheap-module-source-map',
  plugins: [
    ...webpackBaseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true
    }),
  ],
});
