import _ from 'lodash';
import Immutable from 'seamless-immutable';
import path from 'path';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';
import {local} from '../../services/store';
import initialStory from './initial-story.py';
import commonTabsReducers from '../../services/common-tabs-reducers';
import knownFileTypes from './known-file-types';

const initialState = getFirst();

function getFirst() {
  const first = getDefault();

  if (local.get('editorStartingTutorial') !== false) {
    let initialValue = initialStory;

    if (process.platform === 'darwin') {
      initialValue = initialValue.replace('CTRL + ENTER', 'COMMAND + ENTER');
    }

    first.content.initialValue = initialValue;
  }

  return Immutable([{groupId: 'top-left', active: first.id, tabs: [first]}]);
}

function getDefault() {
  const item = {
    label: 'New File',
    contentType: 'ace-pane',
    id: cid(),
    closeable: true,
    content: {
      fontSize: _.toNumber(local.get('fontSize')) || 12,
      highlightLine: true,
      keyBindings: local.get('aceKeyBindings') || 'default',
      tabSize: _.toNumber(local.get('aceTabSpaces')) || 4,
      theme: local.get('aceTheme') || 'chrome',
      useSoftTabs: local.get('aceUseSoftTabs') || true
    }
  };

  knownFileTypes.applyByFilename(item, '');

  return item;
}

/**
 * @param {object} item
 * @returns {object}
 */
function applyLabel(item) {
  const parts = path.parse(item.content.filename || '');

  item.label = parts.base;

  return item;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  const newItem = getDefault();

  if (action.filename) {
    newItem.content.filename = action.filename;

    applyLabel(newItem);
    knownFileTypes.applyByFilename(newItem, action.filename);

    if (action.stats) {
      newItem.content.stats = action.stats;
    }
  }

  return commonTabsReducers.addItem(state, action, newItem);
}

/**
 * This is different from the regular add because they may not know the group id, but we still know it is specifically
 * for a editor-tab-group.  We're not handling the cases where there are multiple editor groups yet.
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function addFile(state, action) {
  const groupIndex = commonTabsReducers.getGroupIndex(state, action);

  if (groupIndex > -1) {
    const groupId = state[groupIndex].groupId;

    state = add(state, _.assign({groupId}, action));
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function closeActiveTab(state, action) {
  const groupId = action.groupId,
    groupIndex = _.findIndex(state, {groupId});

  // later, files might be special, but for now they're just like regular tabs
  if (groupIndex > -1 && state[groupIndex].tabs.length > 1) {
    state = commonTabsReducers.closeActive(state, action);
  }

  return state;
}

/**
 * Closes the active tab in the first group.
 *
 * Likely from a keyboard shortcut.
 *
 * @param {Array} state
 * @returns {Array}
 */
function closeActiveFile(state) {
  if (state[0]) {
    state = closeActiveTab(state, {groupId: state[0].groupId});
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @param {number} move
 * @returns {Array}
 */
function shiftFocus(state, action, move) {
  const groupIndex = commonTabsReducers.getGroupIndex(state, action);

  if (groupIndex > -1) {
    const active = state[groupIndex].active,
      tabIndex = _.findIndex(state[groupIndex].tabs, {id: active});

    if (tabIndex > -1) {
      const newTabIndex = tabIndex + move,
        newTab = state[groupIndex].tabs[newTabIndex];

      if (newTab) {
        state = state.setIn([groupIndex, 'active'], state[groupIndex].tabs[newTabIndex].id);
      }
    }
  }

  return state;
}

function fileSaved(state, action) {
  if (action.filename) {
    const groupIndex = commonTabsReducers.getGroupIndex(state, action),
      id = action.id,
      tabIndex = _.findIndex(state[groupIndex].tabs, {id});

    state = state.updateIn([groupIndex, 'tabs', tabIndex], tab => {
      tab = tab.setIn(['content', 'filename'], action.filename);
      tab = tab.set('label', _.last(action.filename.split(/[\\\/]/)));

      return tab;
    });
  }

  return state;
}

function changePreference(state, action) {
  const change = action.change;

  switch (change.key) {
    case 'fontSize': return commonTabsReducers.changeProperty(state, 'fontSize', change.value, _.toNumber);
    case 'aceTabSpaces': return commonTabsReducers.changeProperty(state, 'tabSize', change.value, _.toNumber);
    case 'aceKeyBindings': return commonTabsReducers.changeProperty(state, 'keyBindings', change.value);
    case 'aceUseSoftTabs': return commonTabsReducers.changeProperty(state, 'useSoftTabs', change.value);
    case 'aceTheme': return commonTabsReducers.changeProperty(state, 'theme', change.value);
    default: return state;
  }
}

function modeChanged(state, action) {
  if (action.value) {
    const groupIndex = commonTabsReducers.getGroupIndex(state, action),
      id = action.id;

    if (groupIndex > -1) {
      const tabIndex = groupIndex > -1 && _.findIndex(state[groupIndex].tabs, {id});

      if (tabIndex > -1) {
        state = state.updateIn([groupIndex, 'tabs', tabIndex], item => {
          item = item.asMutable({deep: true});

          item = knownFileTypes.applyByMode(item, action.value);

          return Immutable(item);
        });
      }
    }
  }

  return state;
}

export default mapReducers({
  ADD_TAB: add,
  ADD_FILE: addFile,
  CLOSE_TAB: commonTabsReducers.close,
  EDITOR_TAB_MODE_CHANGED: modeChanged,
  FOCUS_TAB: commonTabsReducers.focus,
  FILE_IS_SAVED: fileSaved,
  CLOSE_ACTIVE_TAB: closeActiveTab,
  CLOSE_ACTIVE_FILE: closeActiveFile,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1),
  PREFERENCE_CHANGE_SAVED: changePreference
}, initialState);
