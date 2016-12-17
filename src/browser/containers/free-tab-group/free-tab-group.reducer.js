import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import client from '../../services/jupyter/client';
import commonTabsReducers from '../../services/common-tabs-reducers';
import databaseViewerReducer from '../database-viewer/database-viewer.reducer';
import blockTerminalViewerReducer from '../block-terminal-viewer/block-terminal-viewer.reducer';
import documentTerminalViewerReducer from '../document-terminal-viewer/document-terminal-viewer.reducer';
import plotViewerReducer from '../plot-viewer/plot-viewer.reducer';
import globalHistoryViewerReducer from '../global-history-viewer/global-history-viewer.reducer';
import variableViewerReducer from '../variable-viewer/variable-viewer.reducer';
import packageSearchViewerReducer from '../package-search-viewer/package-search-viewer.reducer';
import tabTypes from './tab-types';
import reduxUtil from '../../services/redux-util';
import immutableUtil from '../../services/immutable-util';

const initialState = Immutable.from([]);

function getLastFocusedTabIndex(tabs) {
  if (tabs.length === 0) {
    return -1;
  } else if (tabs.length === 1) {
    return 0;
  }

  let bestTime = tabs[0].lastFocused,
    bestIndex = 0;

  for (let i = 1; i < tabs.length; i++) {
    const tab = tabs[i];

    if (bestTime < tab.lastFocused) {
      bestTime = tab.lastFocused;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function remove(state, groupId, id) {
  const groupIndex = _.findIndex(state, {groupId}),
    tabs = _.get(state, [groupIndex, 'tabs']),
    tabIndex = _.findIndex(tabs, {id});

  if (tabIndex > -1) {
    const lastFocusedIndex = getLastFocusedTabIndex(tabs);

    state = immutableUtil.removeAtPath(state, [groupIndex, 'tabs'], tabIndex);
    if (lastFocusedIndex > -1) {
      // we're not setting a new lastFocused time because we're not really focusing, but going back to a previously
      // focused tab
      state.set('active', tabs[lastFocusedIndex].id);
    }
  }

  return state;
}

/**
 * Move the tab to a different group
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function moveTab(state, action) {
  const payload = action.payload,
    sourceGroupId = payload.sourceGroupId,
    destinationGroupId = payload.destinationGroupId,
    tab = payload.tab;

  state = remove(state, sourceGroupId, tab.id);
  state = add(state, {groupId: destinationGroupId, tab});

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  const tab = action.tab && tabTypes.getDefaultTab(action.tab.contentType);

  if (tab) {
    let item = _.merge(tab, action.tab);

    state = commonTabsReducers.addItem(state, action, item);
  }

  return state;
}

function setJupyterKernelInstance(state, action) {
  if (action.error === true) {
    return state;
  }

  client.setInstance(action.payload);

  return state;
}

export default reduxUtil.reduceReducers(
  mapReducers(_.assign({
    ADD_TAB: add,
    CLOSE_TAB: commonTabsReducers.close,
    FOCUS_TAB: commonTabsReducers.focus,
    MOVE_TAB: moveTab,
    JUPYTER_KERNEL_INSTANCE_SET: setJupyterKernelInstance
  }, databaseViewerReducer), initialState),
  reduxUtil.tabReducer('variable-viewer', variableViewerReducer),
  reduxUtil.tabReducer('global-history-viewer', globalHistoryViewerReducer),
  reduxUtil.tabReducer('plot-viewer', plotViewerReducer),
  reduxUtil.tabReducer('block-terminal-viewer', blockTerminalViewerReducer),
  reduxUtil.tabReducer('document-terminal-viewer', documentTerminalViewerReducer),
  reduxUtil.tabReducer('package-search-viewer', packageSearchViewerReducer),
);
