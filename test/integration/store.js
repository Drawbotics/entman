import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import  { enableBatching } from 'redux-batched-actions';

import {
  reducer as entities,
  middleware as entman,
} from 'index';
import schemas from './schemas';


const reducer = combineReducers({ entities: entities(schemas) });


export default createStore(
  enableBatching(reducer),
  compose(
    applyMiddleware(entman({ enableBatching: true })),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  ),
);
