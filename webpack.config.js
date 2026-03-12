const webpack = require('webpack');

const webpackBaseConfig = require('./webpack.base.config.js');


module.exports = {
  ...webpackBaseConfig,
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    ...webpackBaseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
  ],
};
