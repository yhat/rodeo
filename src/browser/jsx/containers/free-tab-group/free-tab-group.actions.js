import _ from 'lodash';
import commonTabsActions from '../../services/common-tabs-actions';
import cid from '../../services/cid';

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

export default {
  closeTab,
  focusNewestPlot,
  focusPlot,
  focusTab,
  focusFirstTabByType,
  moveTab,
  showDataFrame
};
