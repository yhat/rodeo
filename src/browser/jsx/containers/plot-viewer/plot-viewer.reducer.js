import _ from 'lodash';
import cid from '../../services/cid';
import commonTabsReducers from '../../services/common-tabs-reducers';

const maxPlots = 50;

/**
 * Focus the tab that has a certain plot in it
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function focusPlot(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'plot-viewer', (tab, cursor) => {
    const plots = tab.content.plots;

    if (_.find(plots, {id: action.plot.id})) {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], obj => obj.set('active', action.plot.id));
    }
  });

  return state;
}

/**
 * Add new plot to _every_ plot viewer
 * @param {Immutable} state
 * @param {object} action
 * @param {object|string} action.data
 * @returns {immutable.List}
 */
function addPlot(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'plot-viewer', (tab, cursor) => {
    state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], obj => {
      const newPlot = {
          id: cid(),
          data: action.data,
          createdAt: new Date().getTime()
        },
        plots = obj.plots.asMutable();

      plots.unshift(newPlot);

      if (plots.length > maxPlots) {
        plots.pop();
      }

      obj = obj.set('active', newPlot.id);
      obj = obj.merge({plots});

      return obj;
    });
  });

  return state;
}

function removePlot(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'plot-viewer', (tab, cursor) => {
    const plots = tab.content.plots,
      plotIndex = _.findIndex(plots, {id: action.plot.id});

    if (plotIndex > -1) {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
        const plots = content.plots.asMutable();

        plots.splice(plotIndex, 1);

        return content.merge({plots});
      });
    }
  });

  return state;
}

export default {
  FOCUS_PLOT: focusPlot,
  IOPUB_DATA_DISPLAYED: addPlot,
  REMOVE_PLOT: removePlot
};
