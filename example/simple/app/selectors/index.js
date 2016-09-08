import {
  getEntities,
} from '../../../../src/selectors';
import schemas from '../schemas';


export function getGroups(state) {
  return getEntities(state.entities, schemas.Group);
}


export function checkIfLoadingGroups(state) {
  return state.ui.isLoadingGroups;
}
