import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

import {
  reducer as entities,
  middleware as entman,
} from '../../src';
import schemas from './schemas-test';


const reducer = combineReducers({ entities: entities(schemas) });


export default createStore(
  reducer,
  compose(
    applyMiddleware(entman({ enableBatching: true })),
  ),
);
