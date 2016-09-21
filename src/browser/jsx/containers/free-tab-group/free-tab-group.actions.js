import _ from 'lodash';
import commonTabsActions from '../../services/common-tabs-actions';
import cid from '../../services/cid';
import applicationControl from '../../services/application-control';
import ipc from 'ipc';
import {local} from '../../services/store';

/**
 * Any focus on the tab should redirect the focus to the contents.
 * @param {string} groupId
 * @param {string} id
 * @returns {object};
 */
function focusTab(groupId, id) {
  return {type: 'FOCUS_TAB', groupId, id};
}

function focusPlot(groupId, tabId, plot) {
  return {type: 'FOCUS_PLOT', groupId, tabId, plot};
}

function closeTab(groupId, id) {
  return {type: 'CLOSE_TAB', groupId, id};
}

/**
 * Finds the first tab of a certain type in ANY group, and focuses it.
 * @param {string} contentType
 * @returns {object|undefined}
 */
function focusFirstTabByType(contentType) {
  return function (dispatch, getState) {
    const state = getState();

    // use find instead of each, so we stop iterating after the first found result
    return _.find(state.freeTabGroups, group => {
      return _.find(group.tabs, tab => {
        if (tab.contentType === contentType) {
          return dispatch(focusTab(group.groupId, tab.id));
        }
      });
    });
  };
}

/**
 * Find the newest plot, and if found  then focus on the tab that contains it then focus on the plot
 * @returns {Function}
 */
function focusNewestPlot() {
  return function (dispatch, getState) {
    const state = getState();
    let latestTimestamp = 0,
      latestGroupId,
      latestTabId,
      latestPlot;

    _.each(state.freeTabGroups, group => {
      _.each(group.tabs, tab => {
        if (tab.contentType === 'plot-viewer') {
          const plots = tab.content.plots,
            sortedPlots = _.reverse(_.sortBy(plots, ['createdAt'])),
            plot = _.head(sortedPlots);

          if (plot && plot.createdAt > latestTimestamp) {
            latestTimestamp = plot.createdAt;
            latestGroupId = group.groupId;
            latestTabId = tab.id;
            latestPlot = plot;
          }
        }
      });
    });

    if (latestGroupId && latestTabId && latestPlot) {
      dispatch(focusTab(latestGroupId, latestTabId));
      dispatch(focusPlot(latestGroupId, latestTabId, latestPlot));
    }
  };
}

/**
 * @param {string} toGroupId
 * @param {string} id
 * @returns {function}
 */
function moveTab(toGroupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      fromGroupId = commonTabsActions.findGroupIdByTabId(state.freeTabGroups, id);

    if (fromGroupId) {
      // tab is local to this window, move it
      dispatch({type: 'MOVE_TAB', toGroupId, fromGroupId, id});
    }
  };
}

function showDataFrame(groupId, item) {
  return function (dispatch) {
    dispatch({
      type: 'ADD_TAB',
      groupId,
      id: cid(),
      closeable: true,
      content: {item},
      contentType: 'variable-table-viewer',
      icon: 'table',
      label: item.name || 'DataFrame'
    });
  };
}

function popActiveTab(groupId) {
  return function (dispatch, getState) {
    const state = getState(),
      groupIndex = _.findIndex(state.freeTabGroups, {groupId});

    if (groupIndex > -1) {
      const id = state.freeTabGroups[groupIndex].active,
        tabIndex = _.findIndex(state.freeTabGroups[groupIndex].tabs, {id}),
        tab = state.freeTabGroups[groupIndex].tabs[tabIndex],
        windowName = cid();

      applicationControl.createWindow(windowName, {
        url: 'freeTabsOnlyWindow',
        startActions: [
          _.assign({type: 'ADD_TAB', groupId: null}, tab)
        ]
      });
    }
  };
}

function removePlot(groupId, id, plot) {
  return {type: 'REMOVE_PLOT', groupId, id, plot};
}

function savePlot(plot) {
  return function () {
    // copy file somewhere else
    if (plot.data) {
      const data = plot.data,
        defaultPath = local.get('workingDirectory') || '~';

      if (data['text/html']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'html', extensions: ['html']}]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.html';
          }

          return ipc.send('savePlot', data['text/html'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/png']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'png', extensions: ['png']}]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.png';
          }

          return ipc.send('savePlot', data['image/png'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/svg']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'svg', extensions: ['svg']}]
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

export default {
  closeTab,
  focusNewestPlot,
  focusPlot,
  focusTab,
  focusFirstTabByType,
  moveTab,
  removePlot,
  savePlot,
  showDataFrame,
  popActiveTab
};
