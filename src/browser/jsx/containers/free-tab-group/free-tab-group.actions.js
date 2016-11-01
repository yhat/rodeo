import _ from 'lodash';
import bluebird from 'bluebird';
import commonTabsActions from '../../services/common-tabs-actions';
import cid from '../../services/cid';
import applicationControl from '../../services/application-control';
import api from '../../services/api';
import {local} from '../../services/store';
const tabGroupName = 'freeTabGroups';

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
 * @param {string} contentType
 * @param {object} state
 * @returns {Promise.boolean}
 */
function getTabExists(contentType, state) {
  const groups = state[tabGroupName];

  if (commonTabsActions.isTabContentTypeInGroups(contentType, groups)) {
    return bluebird.resolve(true);
  } else {
    return applicationControl.surveyTabs().then(function (tabSurvey) {
      return commonTabsActions.isTabContentTypeInWindowList(contentType, tabSurvey, tabGroupName);
    });
  }
}

function guaranteeTab(contentType) {
  return function (dispatch, getState) {
    const state = getState();

    return getTabExists(contentType, state).then(function (exists) {
      if (!exists) {
        const state = getState(),
          firstGroup = _.head(state[tabGroupName]),
          groupId = firstGroup && firstGroup.groupId;

        // If the tab didn't exist before, then it's going to be closeable now so they can
        // return to their previous good state.
        dispatch({type: 'ADD_TAB', groupId, tab: {contentType, closeable: true}});
      }
    }).catch(error => console.error('LAME', error));
  };
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
      tab: {
        content: {item},
        contentType: 'variable-table-viewer',
        label: item.name
      }
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
          _.assign({type: 'ADD_TAB', groupId: null, tab})
        ]
      });
    }
  };
}

function removePlot(groupId, id, plot) {
  return {type: 'REMOVE_PLOT', groupId, id, plot};
}

function showSaveDialog(mime, ext, data) {
  const defaultPath = local.get('workingDirectory') || '~';

  return api.send('saveDialog', {
    defaultPath,
    filters: [{name: ext, extensions: [ext]}]
  }).then(function (filename) {
    if (!_.includes(filename, '.')) {
      filename += '.' + ext;
    }

    return api.send('savePlot', data[mime], filename);
  }).catch(error => console.error(error));
}

function savePlot(plot) {
  return function () {
    const data = plot.data;

    // copy file somewhere else
    if (data) {
      if (data['text/html']) {
        return showSaveDialog('text/html', 'html', data);
      } else if (data['image/png']) {
        return showSaveDialog('image/png', 'png', data);
      } else if (data['image/svg']) {
        return showSaveDialog('image/svg', 'svg', data);
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
  guaranteeTab,
  moveTab,
  removePlot,
  savePlot,
  showDataFrame,
  popActiveTab
};
