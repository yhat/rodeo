import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import {local} from '../../services/store';

export function getInitialState() {

  return Immutable({
    askQuit: local.get('askQuit') || true
  });
}

function quiting(state) {
  return state.set('state', 'quiting');
}

function quit(state) {
  return state.set('state', 'quit');
}

function changeSaved(state, action) {
  const key = action.change.key;

  if (key === 'askQuit') {
    state = state.set('askQuit', action.change.value);
  }

  return state;
}

export default mapReducers({
  QUITING: quiting,
  QUIT: quit,
  PREFERENCE_CHANGE_SAVED: changeSaved
}, {});
