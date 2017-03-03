const path = require('path');
const webpack = require('webpack');


const rootDirs = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'test'),
];


module.exports = {
  resolve: {
    modules: [
      ...rootDirs,
      path.resolve(__dirname, 'node_modules'),
    ],
    extensions: ['.js'],
  },
  entry: [ './src/index.js' ],
  output: {
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/',
    filename: 'entman.js',
    library: 'entman',
    libraryTarget: 'umd',
  },
  plugins: [
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        include: rootDirs,
        use: [
          {
            loader: 'eslint-loader',
          },
        ],
      },
      {
        test: /\.jsx?$/,
        include: rootDirs,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [ [ 'es2015', { modules: false } ], 'stage-0' ],
              plugins: [ 'istanbul' ],
            },
          },
        ],
      }
    ],
  },
};
