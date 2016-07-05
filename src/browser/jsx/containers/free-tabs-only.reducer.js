import { combineReducers } from 'redux';
import applicationControl from '../services/application-control';
import freeTabGroups from './free-tab-group/free-tab-group.reducer';

function broadcast(state, action) {
  applicationControl.shareAction(action);

  if (!state) {
    return {};
  }

  return state;
}

export default combineReducers({
  freeTabGroups,
  broadcast
});
