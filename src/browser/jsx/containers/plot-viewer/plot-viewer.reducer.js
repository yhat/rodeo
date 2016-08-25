import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

const initialState = [],
  maxPlots = 50;

function getDefault() {
  return {
    id: cid(),
    hasFocus: true,
    createdAt: new Date().getTime()
  };
}

/**
 * Create a new plot
 * @param {Array} state
 * @param {object} action
 * @param {object|string} action.data
 * @returns {Array}
 */
function add(state, action) {
  const item = getDefault(),
    activePlot = _.find(state, { hasFocus: true });

  // put data into an element (not in global state!), return id.
  state = _.clone(state);
  item.data = action.data;
  item.hasFocus = true;
  state.unshift(item);

  // if more than max plots, remove oldest plot
  if (state.length > maxPlots) {
    state.pop();
  }

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

function focus(state, action) {
  const id = action.plot.id,
    activePlot = _.find(state, {hasFocus: true}),
    targetPlot = _.find(state, {id});

  if (targetPlot && targetPlot !== activePlot) {
    state = _.clone(state);
    if (activePlot) {
      activePlot.hasFocus = false;
    }
    targetPlot.hasFocus = true;
  }

  return state;
}

function remove(state, action) {
  const id = action.plot.id,
    plot = _.find(state, {id});

  if (plot) {
    state = _.without(state, plot);
  }

  return state;
}

export default mapReducers({
  IOPUB_DATA_DISPLAYED: add,
  REMOVE_ACTIVE_PLOT: removeActive,
  FOCUS_PLOT: focus,
  REMOVE_PLOT: remove
}, initialState);
