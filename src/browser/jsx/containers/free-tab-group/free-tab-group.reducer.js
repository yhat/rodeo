import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabsReducers from '../../services/common-tabs-reducers';
import databaseViewerReducer from '../database-viewer/database-viewer.reducer';
import blockTerminalViewerReducer from '../terminal-viewer/terminal-viewer.reducer';
import documentTerminalViewerReducer from '../document-terminal-viewer/document-terminal-viewer.reducer';
import plotViewerReducer from '../plot-viewer/plot-viewer.reducer';
import {local} from '../../services/store';
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

function iopubInputExecuted(state, action) {
  const historyMaxSetting = local.get('terminalHistory'),
    historyMax = historyMaxSetting === null ? 50 : historyMaxSetting;

  if (historyMax > 0 && _.isString(action.text) && action.text.trim().length > 0) {
    // put new history into each history viewer
    commonTabsReducers.eachTabByActionAndContentType(state, action, 'history-viewer', (tab, cursor) => {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
        const history = content.history.asMutable();

        history.push({text: action.text});

        if (history.length > historyMax) {
          history.shift();
        }

        return content.merge({history});
      });
    });
  }

  return state;
}

export default reduxUtil.reduceReducers(
  mapReducers(_.assign({
    ADD_TAB: add,
    CLOSE_TAB: commonTabsReducers.close,
    FOCUS_TAB: commonTabsReducers.focus,
    IOPUB_EXECUTED_INPUT: iopubInputExecuted,
    MOVE_TAB: moveTab,
    VARIABLES_CHANGED: variablesChanged
  }, databaseViewerReducer), initialState),
  reduxUtil.tabReducer(plotViewerReducer),
  reduxUtil.tabReducer(blockTerminalViewerReducer),
  reduxUtil.tabReducer(documentTerminalViewerReducer)
);
