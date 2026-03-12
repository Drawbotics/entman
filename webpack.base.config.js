const path = require('path');


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
    path: path.resolve(__dirname, 'dist'),
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
        include: rootDirs,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [ [ '@babel/preset-env', { modules: false } ] ],
              plugins: [ '@babel/plugin-proposal-export-default-from' ],
            },
          },
        ],
      }
    ],
  },
};
