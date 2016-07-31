import _ from 'lodash';
import commonTabsActions from '../../services/common-tabs-actions';

/**
 * Any focus on the tab should redirect the focus to the contents.
 * @param {string} groupId
 * @param {string} id
 * @returns {object};
 */
function focusTab(groupId, id) {
  return {type: 'FOCUS_TAB', groupId, id};
}

function focusPlot(groupId, tabId, id) {
  return {type: 'FOCUS_PLOT', groupId, tabId, id};
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
    let latestTimestamp,
      latestGroupId,
      latestTabId,
      latestId;

    _.each(state.freeTabGroups, group => {
      _.each(group.tabs, tab => {
        if (tab.contentType === 'plot-viewer') {
          const plots = tab.content.plots,
            sortedPlots = _.reverse(_.sortBy(plots, ['createdAt'])),
            plot = _.head(sortedPlots),
            timestamp = plot.createdAt;

          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestGroupId = group.groupId;
            latestTabId = tab.id;
            latestId = plot.id;
          }
        }
      });
    });

    if (latestGroupId && latestTabId && latestId) {
      dispatch(focusPlot(latestGroupId, latestTabId, latestId));
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

export default {
  closeTab,
  focusNewestPlot,
  focusPlot,
  focusTab,
  focusFirstTabByType,
  moveTab
};
