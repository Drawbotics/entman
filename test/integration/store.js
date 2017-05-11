import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

import {
  reducer as entities,
  middleware as entman,
} from '../../lib';
import schemas from './schemas';


const reducer = combineReducers({ entities: entities(schemas) });


export default createStore(
  reducer,
  compose(
    applyMiddleware(entman({ enableBatching: true })),
    window.devToolsExtension ? window.devToolsExtension() : (f) => f,
  ),
);
