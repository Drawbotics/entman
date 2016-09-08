import { createStore, compose } from 'redux';

import reducer from './reducer';


export default createStore(
  reducer,
  compose(
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ),
);
