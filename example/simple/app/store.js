import { createStore, compose, applyMiddleware } from 'redux';

import entitiesMiddleware from '../../../src/middleware';

import reducer from './reducer';


export default createStore(
  reducer,
  compose(
    applyMiddleware(
      entitiesMiddleware(),
    ),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ),
);
