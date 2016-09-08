import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './store';

import Groups from './containers/Groups';


ReactDOM.render(
  <Provider store={store}>
    <Groups />
  </Provider>,
  document.getElementById('root'),
);
