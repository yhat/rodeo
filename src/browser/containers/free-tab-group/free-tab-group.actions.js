import _ from 'lodash';
import api from '../../services/api';
import bluebird from 'bluebird';
import path from 'path';
import commonTabsActions from '../../services/common-tabs-actions';
import cid from '../../services/cid';
import client from '../../services/jupyter/client';
import applicationControl from '../../services/application-control';
import databaseConnectionActions from '../../actions/database-connection';
import {local} from '../../services/store';
import blockTerminalViewerActions from '../block-terminal-viewer/block-terminal-viewer.actions';
import documentTerminalViewerActions from '../document-terminal-viewer/document-terminal-viewer.actions';
import plotViewerActions from '../plot-viewer/plot-viewer.actions';
import manageConnectionsSelectors from '../manage-connections-viewer/manage-connections.selectors';
import pythonLanguage from '../../services/jupyter/python-language';
import selectionUtil from '../../services/selection-util';

const tabGroupName = 'freeTabGroups',
  pythonTypes = ['python'],
  sqlTypes = ['sql', 'pgsql', 'mysql', 'sqlserver'];

/**
 * Any focus on the tab should redirect the focus to the contents.
 * @param {string} groupId
 * @param {string} id
 * @returns {object};
 */
function focusTab(groupId, id) {
  return {type: 'FOCUS_TAB', groupId, id};
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
    }).catch(error => console.error(error));
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
          _.defer(() => {
            const el = document.getElementById(tab.id),
              focusable = el && el.querySelector('[tabIndex="0"]');

            if (focusable) {
              focusable.focus();
              selectionUtil.selectElement(focusable);
            }
          });

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
      dispatch(plotViewerActions.focus(latestGroupId, latestTabId, latestPlot));
    }
  };
}

/**
 * @param {object} payload
 * @returns {object}
 */
function moveTab(payload) {
  return {type: 'MOVE_TAB', payload};
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

      return client.getInstance().then(function (instance) {
        const url = 'freeTabsOnlyWindow',
          startActions = [];

        if (instance) {
          startActions.push({type: 'JUPYTER_KERNEL_INSTANCE_SET', payload: instance});
        }

        startActions.push({type: 'ADD_TAB', groupId: null, tab, meta: {sender: 'self'}});

        applicationControl.createWindow(windowName, {url, startActions});
      });
    }
  };
}

function showSaveDialog(potentialTypes) {
  const defaultPath = local.get('workingDirectory') || '~',
    filters = _.map(potentialTypes, type => ({name: type.mime, extensions: [type.ext]}))
      .concat([{name: 'All files', extensions: ['*']}]);

  return api.send('saveDialog', _.cloneDeep({defaultPath, filters}));
}

function getTypeByExt(filename, potentialTypes) {
  const filenameParts = path.parse(filename);

  if (filenameParts.ext) {
    return _.find(potentialTypes, {ext: filenameParts.ext.replace(/^\./, '')});
  }
}

function savePlotToFilename(potentialTypes, data) {
  return function (filename) {
    let type = getTypeByExt(filename, potentialTypes);

    if (!type || !data[type.mime]) {
      type = _.head(potentialTypes);
    }

    if (type && !_.includes(filename, '.') && type.ext && type.ext !== '*') {
      filename += '.' + type.ext;
    }

    if (type && data[type.mime]) {
      return api.send('savePlot', data[type.mime], filename);
    }
  };
}

function saveDataToFilename(potentialTypes, data) {
  return function (filename) {
    let type = getTypeByExt(filename, potentialTypes);

    if (!type || !data[type.mime]) {
      type = _.head(potentialTypes);
    }

    if (type && !_.includes(filename, '.') && type.ext && type.ext !== '*') {
      filename += '.' + type.ext;
    }

    if (type && data[type.mime]) {
      return api.send('saveFile', filename, data[type.mime]);
    }
  };
}

function savePlot(plot) {
  return function () {
    const data = plot.data,
      types = [
        {mime: 'text/html', ext: 'html'},
        {mime: 'image/png', ext: 'png'},
        {mime: 'image/svg', ext: 'svg'},
        {mime: 'image/jpg', ext: 'jpg'},
        {mime: 'image/jpeg', ext: 'jpeg'}
      ],
      potentialTypes = data && _.filter(types, type => data[type.mime]);

    // copy file somewhere else
    if (potentialTypes && potentialTypes.length) {
      return showSaveDialog(potentialTypes)
        .then(savePlotToFilename(potentialTypes, data))
        .catch(error => console.error(error));
    }
  };
}

function saveData(data) {
  return function () {
    const types = [
        {mime: 'text/html', ext: 'html'},
        {mime: 'image/png', ext: 'png'},
        {mime: 'image/svg', ext: 'svg'},
        {mime: 'image/jpg', ext: 'jpg'},
        {mime: 'image/jpeg', ext: 'jpeg'},
        {mime: 'text/csv', ext: 'csv'},
        {mime: 'text/plain', ext: '*'}
      ],
      potentialTypes = data && _.filter(types, type => data[type.mime]);

    if (potentialTypes && potentialTypes.length) {
      return showSaveDialog(potentialTypes)
        .then(saveDataToFilename(potentialTypes, data))
        .catch(error => console.error(error));
    }
  };
}

function findTabTokens(groups, fn) {
  const tabTokens = [];

  _.each(groups, group => {
    _.each(group.tabs, tab => {
      if (fn(tab)) {
        const groupId = group.groupId,
          tabId = tab.id;

        tabTokens.push({groupId, tabId, tab});
      }
    });
  });

  return tabTokens;
}

function getLastFocusedTabToken(tabTokens) {
  if (tabTokens.length === 0) {
    return null;
  } else if (tabTokens.length === 1) {
    return tabTokens[0];
  }

  let bestTabToken = tabTokens[0],
    bestTabTokenTime = tabTokens[0].tab.lastFocused;

  for (let i = 1; i < tabTokens.length; i++) {
    const tab = tabTokens[i].tab,
      newTime = tab.lastFocused;

    if (bestTabTokenTime < tab.lastFocused) {
      bestTabToken = tabTokens[i];
      bestTabTokenTime = newTime;
    }
  }

  return bestTabToken;
}

/**
 * Execute some text from an editor in a certain kind of mode
 * @param {object} context
 * @returns {function}
 */
function execute(context) {
  const text = context.text,
    mode = context.mode;

  return function (dispatch, getState) {
    const hasText = _.trim(text) !== '';

    if (hasText) {
      if (_.includes(pythonTypes, mode)) {
        // todo: find if code is runnable

        // if it starts with #, it's not runnable -- if it is multi-line, assume it is runnable
        if (pythonLanguage.isCodeLine(text) || text.indexOf('\n') > -1) {
          // find recent python terminal tab
          return applicationControl.surveyTabs().then(function (result) {
            const groups = _.flatten(_.map(result, 'freeTabGroups')),
              isTerminal = tab => _.includes(['document-terminal-viewer', 'block-terminal-viewer'], tab.contentType),
              tabTokens = findTabTokens(groups, isTerminal),
              latestTabToken = getLastFocusedTabToken(tabTokens);

            if (latestTabToken) {
              const terminalTypes = {
                'block-terminal-viewer': blockTerminalViewerActions.execute,
                'document-terminal-viewer': documentTerminalViewerActions.execute
              };

              return dispatch(terminalTypes[latestTabToken.tab.contentType](latestTabToken.groupId, latestTabToken.tabId, {text}));
            }
          });
        }
      } else if (_.includes(sqlTypes, mode)) {
        // if no connection, open manageConnectionsDialog
        const state = getState(),
          connection = manageConnectionsSelectors.getConnection(state);

        if (connection) {
          const id = connection.id;

          return dispatch(databaseConnectionActions.query({id, text}));
        } else {
          // show manage connections dialog
          dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'MANAGE_CONNECTIONS', title: 'Manage Connections'});
        }
      }
    }
  };
}

function openExternal(url) {
  return function () {
    return api.send('openExternal', url);
  };
}

export default {
  closeTab,
  execute,
  focusNewestPlot,
  focusTab,
  focusFirstTabByType,
  guaranteeTab,
  moveTab,
  openExternal,
  savePlot,
  saveData,
  showDataFrame,
  popActiveTab
};
