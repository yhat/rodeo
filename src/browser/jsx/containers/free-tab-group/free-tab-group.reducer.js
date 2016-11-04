import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabsReducers from '../../services/common-tabs-reducers';
import databaseViewerReducer from '../database-viewer/database-viewer.reducer';
import blockTerminalViewerReducer from '../block-terminal-viewer/block-terminal-viewer.reducer';
import documentTerminalViewerReducer from '../document-terminal-viewer/document-terminal-viewer.reducer';
import plotViewerReducer from '../plot-viewer/plot-viewer.reducer';
import globalHistoryViewerReducer from '../global-history-viewer/global-history-viewer.reducer';
import tabTypes from './tab-types';
import reduxUtil from '../../services/redux-util';

const initialState = Immutable.from([]);

/**
 * Move the tab to a different group
 * @param {object} oldState
 * @param {object} action
 * @param {string} action.toGroupId
 * @param {string} action.fromGroupId
 * @param {string} action.id
 * @returns {object}
 */
function moveTab(oldState, action) {
  const state = _.cloneDeep(oldState),
    toGroup = state[_.findIndex(state, {groupId: action.toGroupId})],
    fromGroup = state[_.findIndex(state, {groupId: action.fromGroupId})],
    fromGroupItemIndex = fromGroup && _.findIndex(fromGroup.tabs, {id: action.id}),
    removedItems = fromGroup && fromGroupItemIndex !== -1 && fromGroup.tabs.splice(fromGroupItemIndex, 1);

  if (!toGroup) {
    return oldState;
  }

  toGroup.tabs = toGroup.tabs.concat(removedItems);

  // dragged item takes focus in the new location
  toGroup.active = action.id;

  // if moving to new group and item had focus, move focus to left item
  if (toGroup !== fromGroup && removedItems && removedItems.length && removedItems[0].id === fromGroup.active) {
    if (fromGroupItemIndex === 0 && fromGroup.tabs.length) {
      fromGroup.active = fromGroup.tabs[0].id;
    } else if (fromGroup.tabs[fromGroupItemIndex - 1]) {
      fromGroup.active = fromGroup.tabs[fromGroupItemIndex - 1].id;
    }
  }

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

function variablesChanged(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'variable-viewer', (tab, cursor) => {
    state = state.setIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content', 'variables'], action.variables);
  });

  return state;
}

export default reduxUtil.reduceReducers(
  mapReducers(_.assign({
    ADD_TAB: add,
    CLOSE_TAB: commonTabsReducers.close,
    FOCUS_TAB: commonTabsReducers.focus,
    MOVE_TAB: moveTab,
    VARIABLES_CHANGED: variablesChanged
  }, databaseViewerReducer), initialState),
  reduxUtil.tabReducer('global-history-viewer', globalHistoryViewerReducer),
  reduxUtil.tabReducer('plot-viewer', plotViewerReducer),
  reduxUtil.tabReducer('block-terminal-viewer', blockTerminalViewerReducer),
  reduxUtil.tabReducer('document-terminal-viewer', documentTerminalViewerReducer)
);
