import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import reduxThunk from 'redux-thunk';

import {
  reducer as entities,
  middleware as entman,
} from 'index';
import schemas from './schemas';


const reducer = combineReducers({ entities: entities(schemas) });


export default createStore(
  reducer,
  compose(
    applyMiddleware(reduxThunk, entman),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  ),
);
