import { combineReducers } from 'redux';

import entities from '../../../../src/reducer';
import schemas from '../schemas';


export default combineReducers({
  entities: entities(schemas),
});
