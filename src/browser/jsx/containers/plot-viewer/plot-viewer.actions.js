import _ from 'lodash';
import freeTabGroupAction from '../free-tab-group/free-tab-group.actions';

function focusPlot(id) {
  return {type: 'FOCUS_PLOT', id};
}

function focusNewestPlot() {
  return function (dispatch, getState) {
    const state = getState(),
      plots = state.plots,
      sortedPlots = _.reverse(_.sortBy(plots, ['createdAt'])),
      newestPlot = _.head(sortedPlots);

    sortedPlots.reverse();

    dispatch(freeTabGroupAction.focusFirstTabByType('plot-viewer'));
    if (newestPlot) {
      dispatch(focusPlot(newestPlot.id));
    }
  };
}

export default {
  focusPlot,
  focusNewestPlot,
  focusNextPlot,
  focusPrevPlot,
  openActivePlot,
  removeActivePlot,
  saveActivePlot
};
