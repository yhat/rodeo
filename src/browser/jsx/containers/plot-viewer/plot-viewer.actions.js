import _ from 'lodash';
import ipc from 'ipc';
import freeTabGroupAction from '../free-tab-group/free-tab-group.actions';

function removeActivePlot() {
  return {type: 'REMOVE_ACTIVE_PLOT'};
}

function focusNextPlot() {
  return {type: 'FOCUS_NEXT_PLOT'};
}

function focusPrevPlot() {
  return {type: 'FOCUS_PREV_PLOT'};
}

function saveActivePlot() {
  return {type: 'SAVE_ACTIVE_PLOT'};
}

function openActivePlot() {
  return {type: 'OPEN_ACTIVE_PLOT'};
}

function focus(plot) {
  return {type: 'FOCUS_PLOT', plot};
}

function remove(plot) {
  return {type: 'REMOVE_PLOT', plot};
}

function save(plot) {
  return function () {
    // copy file somewhere else
    if (plot.data) {
      const data = plot.data;

      if (data['text/html']) {
        return ipc.send('saveDialog', {
          filters: [{ name: 'html', extensions: ['html'] }]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.html';
          }

          return ipc.send('savePlot', data['text/html'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/png']) {
        return ipc.send('saveDialog', {
          filters: [{ name: 'png', extensions: ['png'] }]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.png';
          }

          return ipc.send('savePlot', data['image/png'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/svg']) {
        return ipc.send('saveDialog', {
          filters: [{ name: 'svg', extensions: ['svg'] }]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.svg';
          }

          return ipc.send('savePlot', data['image/svg'], filename);
        }).catch(error => console.error(error));
      }
    }
  };
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
      dispatch(focus(newestPlot));
    }
  };
}

export default {
  focus,
  remove,
  save,
  focusNewestPlot,
  focusNextPlot,
  focusPrevPlot,
  openActivePlot,
  removeActivePlot,
  saveActivePlot
};
