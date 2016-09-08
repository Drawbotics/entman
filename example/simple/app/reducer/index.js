import { combineReducers } from 'redux';

import entities from '../../../../src/reducer';
import schemas from '../schemas';
import ui from './ui';


export default combineReducers({
  entities: entities(schemas),
  ui,
});
