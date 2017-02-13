if ( ! global._babelPolyfill) {
  require('babel-polyfill');
}


export reducer from './reducer';
export * from './selectors';
export * from './helpers';
export * from './schema';
export middleware from './middleware';
