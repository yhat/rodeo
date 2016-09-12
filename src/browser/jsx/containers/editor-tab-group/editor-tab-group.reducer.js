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
    first.initialValue = initialStory;
  }

  return Immutable([{groupId: 'top-left', active: first.id, tabs: [first]}]);
}

function getDefault() {
  return {
    label: 'New File',
    mode: 'python',
    contentType: 'ace-pane',
    id: cid(),
    keyBindings: local.get('aceKeyBindings') || 'default',
    tabSize: _.toNumber(local.get('aceTabSpaces')) || 4,
    icon: 'file-code-o',
    closeable: true,
    fontSize: _.toNumber(local.get('fontSize')) || 12,
    theme: local.get('aceTheme') || 'chrome',
    useSoftTabs: local.get('aceUseSoftTabs') || true
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
function closeActive(state, action) {
  const tabs = _.head(state).tabs,
    focusIndex = _.findIndex(tabs, {hasFocus: true}),
    focusItem = tabs[focusIndex];

  return remove(state, _.assign({id: focusItem.id}, action));
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

/**
 * @param {object} state
 * @param {string} propertyName
 * @param {*} value
 * @param {function} [transform]
 * @returns {object}
 */
function changeProperty(state, propertyName, value, transform) {
  state = _.cloneDeep(state);

  if (transform) {
    value = transform(value);
  }

  const tabs = _.head(state).tabs;

  _.each(tabs, (item) => _.set(item, propertyName, value));

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
    case 'fontSize': return changeProperty(state, 'fontSize', change.value, _.toNumber);
    case 'aceTabSpaces': return changeProperty(state, 'tabSize', change.value, _.toNumber);
    case 'aceKeyBindings': return changeProperty(state, 'keyBindings', change.value);
    case 'aceUseSoftTabs': return changeProperty(state, 'useSoftTabs', change.value);
    case 'aceTheme': return changeProperty(state, 'theme', change.value);
    default: return state;
  }
}

export default mapReducers({
  ADD_TAB: add,
  CLOSE_TAB: commonTabsReducers.close,
  FOCUS_TAB: commonTabsReducers.focus,
  FILE_IS_SAVED: fileSaved,
  CLOSE_ACTIVE_FILE: closeActive,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1),
  PREFERENCE_CHANGE_SAVED: changePreference
}, initialState);
