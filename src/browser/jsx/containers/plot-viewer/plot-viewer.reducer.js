import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';
import Immutable from 'seamless-immutable';

const maxPlots = 50,
  prefix = reduxUtil.fromFilenameToPrefix(__filename);

/**
 * Focus the tab that has a certain plot in it
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function focusPlot(state, action) {
  const plots = state.plots;

  if (_.find(plots, {id: action.plot.id})) {
    state = state.set('active', action.plot.id);
  }

  return state;
}

function removePlot(state, action) {
  const plotIndex = _.findIndex(state.plots, {id: action.plot.id});

  if (plotIndex > -1) {
    const plots = state.plots.asMutable();

    plots.splice(plotIndex, 1);

    state = state.set('plots', Immutable(plots));
  }

  return state;
}

function jupyterResponse(state, action) {
  if (state.plots) {
    const id = cid(),
      messageType = _.get(action, 'payload.result.msg_type'),
      data = _.get(action, 'payload.result.content.data');

    if (data && messageType === 'display_data') {
      const createdAt = new Date().getTime(),
        newPlot = {id, data, createdAt},
        plots = state.plots.asMutable();

      plots.unshift(newPlot);

      if (plots.length > maxPlots) {
        plots.pop();
      }

      state = state.set('active', newPlot.id);
      state = state.merge({plots});
    }
  }

  return state;
}

export default mapReducers(
  _.assign(reduxUtil.addPrefixToKeys(prefix, {
    FOCUS_PLOT: focusPlot,
    REMOVE_PLOT: removePlot
  }), {
    JUPYTER_RESPONSE: jupyterResponse,
  }, {})
);

