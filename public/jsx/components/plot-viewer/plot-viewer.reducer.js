import _ from 'lodash';
import AcePane from './ace-pane.jsx';
import cid from '../../services/cid';

const refreshPanes = _.throttle(() => AcePane.resizeAll(), 50),
  initialState = [];

function getDefault() {
  return {
    id: cid(),
    hasFocus: true
  };
}

function add(state, action) {
  const data = action.data,
    item = getDefault();

  // put data into an element (not in global state!), return id.
  state = _.clone(state);
  state.push(item);

  return state;
}

function removeActive(state, action) {
  const id = action.id,
    activePlot = _.find(state, { id });

  if (activePlot) {
    state = _.without(state, activePlot);
  }

  return state;
}

export default function (state, action) {
  switch (action.type) {
    case 'ADD_DISPLAY_DATA': return add(state, action);
    case 'REMOVE_ACTIVE_PLOT': return removeActive(state, action);
    default: return state;
  }
}