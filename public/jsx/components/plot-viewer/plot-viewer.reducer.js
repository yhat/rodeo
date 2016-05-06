import _ from 'lodash';
import cid from '../../services/cid';

const initialState = [];

function getDefault() {
  return {
    id: cid(),
    hasFocus: true
  };
}

function add(state, action) {
  const item = getDefault(),
    activePlot = _.find(state, { hasFocus: true });

  // put data into an element (not in global state!), return id.
  state = _.clone(state);
  item.data = action.data;
  state.push(item);

  if (activePlot) {
    activePlot.hasFocus = false;
  }

  return state;
}

function removeActive(state) {
  const activePlot = _.find(state, { hasFocus: true });

  if (activePlot) {
    state = _.without(state, activePlot);
  }

  return state;
}

function focusById(state, action) {
  const id = action.id,
    activePlot = _.find(state, { hasFocus: true }),
    targetPlot = _.find(state, { id });

  if (targetPlot && targetPlot !== activePlot) {
    state = _.clone(state);
    if (activePlot) {
      activePlot.hasFocus = false;
    }
    targetPlot.hasFocus = true;
  }

  return state;
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'ADD_DISPLAY_DATA': return add(state, action);
    case 'REMOVE_ACTIVE_PLOT': return removeActive(state, action);
    case 'FOCUS_PLOT': return focusById(state, action);
    default: return state;
  }
}