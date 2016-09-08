import { combineReducers } from 'redux';

import {
  LOAD_GROUPS,
  LOAD_GROUPS_DONE,
} from '../actions';


function isLoadingGroups(state=false, action) {
  switch (action.type) {
    case LOAD_GROUPS: {
      return true;
    }
    case LOAD_GROUPS_DONE: {
      return false;
    }
    default:
      return state;
  }
}


export default combineReducers({
  isLoadingGroups,
});
