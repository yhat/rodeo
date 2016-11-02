import mapReducers from '../../services/map-reducers';
import promptActions from '../../services/prompt-actions';
import reduxUtil from '../../services/redux-util';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function command(state, action) {
  const payload = action.payload,
    name = payload.name;

  if (promptActions[name]) {
    state = promptActions[name](state, payload);
  }

  return state;
}

function copyToPrompt(state, action) {
  const payload = action.payload,
    lines = payload.lines;

  // put lines
  return _.assign({}, state, {
    lines,
    cursor: {row: lines.length - 1, column: _.last(lines).length},
    historyIndex: -1
  });
}

export default mapReducers(reduxUtil.addPrefixToKeys(prefixType, {
  COPY_TO_PROMPT: copyToPrompt,
  COMMAND: command
}), {});
