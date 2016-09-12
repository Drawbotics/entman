const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');


const plugins = webpackBaseConfig.plugins || [];


module.exports = Object.assign({}, webpackBaseConfig, {
  devtool: 'cheap-module-source-map',
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.DedupePlugin(),
    //new webpack.optimize.UglifyJsPlugin({
      //drop_console: true
    //}),
  ],
});
