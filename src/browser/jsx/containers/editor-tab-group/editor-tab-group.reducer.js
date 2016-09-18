import _ from 'lodash';
import Immutable from 'seamless-immutable';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';
import {local} from '../../services/store';
import initialStory from 'raw!./initial-story.py';
import commonTabsReducers from '../../services/common-tabs-reducers';

const initialState = getFirst();

function getFirst() {
  const first = getDefault();

  if (local.get('editorStartingTutorial') !== false) {
    first.content.initialValue = initialStory;
  }

  return Immutable([{groupId: 'top-left', active: first.id, tabs: [first]}]);
}

function getDefault() {
  return {
    label: 'New File',
    contentType: 'ace-pane',
    id: cid(),
    icon: 'file-code-o',
    closeable: true,
    content: {
      fontSize: _.toNumber(local.get('fontSize')) || 12,
      highlightLine: true,
      keyBindings: local.get('aceKeyBindings') || 'default',
      mode: 'python',
      tabSize: _.toNumber(local.get('aceTabSpaces')) || 4,
      theme: local.get('aceTheme') || 'chrome',
      useSoftTabs: local.get('aceUseSoftTabs') || true
    }
  };
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  const newItem = getDefault();

  if (action.filename) {
    newItem.filename = action.filename;
    newItem.label = _.last(action.filename.split(/[\\\/]/));

    if (action.stats) {
      newItem.stats = action.stats;
    }
  }

  return commonTabsReducers.addItem(state, action, newItem);
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
  state = _.cloneDeep(state);
  const tabs = _.head(state).tabs,
    focusIndex = _.findIndex(tabs, {hasFocus: true}),
    focusItem = tabs[focusIndex],
    newFocusIndex = focusIndex + move,
    newFocusItem = tabs[newFocusIndex];

  if (newFocusItem) {
    focusItem.hasFocus = false;
    newFocusItem.hasFocus = true;
  }

  return state;
}

function fileSaved(state, action) {
  if (action.filename) {
    state = _.cloneDeep(state);

    const tabs = _.head(state).tabs,
      focusedAce = state && _.find(tabs, {hasFocus: true});

    focusedAce.filename = action.filename;
    focusedAce.label = _.last(action.filename.split(/[\\\/]/));
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

export default mapReducers({
  ADD_TAB: add,
  CLOSE_TAB: commonTabsReducers.close,
  FOCUS_TAB: commonTabsReducers.focus,
  FILE_IS_SAVED: fileSaved,
  CLOSE_ACTIVE_TAB: closeActiveTab,
  CLOSE_ACTIVE_FILE: closeActiveFile,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1),
  PREFERENCE_CHANGE_SAVED: changePreference
}, initialState);
