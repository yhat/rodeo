import mapReducers from '../../services/map-reducers';
import promptActions from '../../services/prompt-actions';

export function insertKey(state, action) {
  return promptActions.insertKey(state, action.key);
}

function command(state, action) {
  const payload = action.payload,
    name = payload.name;

  if (promptActions[name]) {
    state = promptActions[name](state, payload);
  }

  return state;
}

export default mapReducers({
  PROMPT_VIEWER_COMMAND: command
}, {});
