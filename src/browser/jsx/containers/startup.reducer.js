import applicationControl from '../services/application-control';
import { combineReducers } from 'redux';
import setup from './setup-viewer/setup-viewer.reducer';

function broadcast(state, action) {
  applicationControl.shareAction(action);

  if (!state) {
    return {};
  }

  return state;
}

export default combineReducers({
  setup,
  broadcast
});
