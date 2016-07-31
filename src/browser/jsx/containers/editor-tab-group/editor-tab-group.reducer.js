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

  first.initialValue = initialStory;

  return Immutable([{groupId: 'top-left', active: first.id, items: [first]}]);
}

function getDefault() {
  return {
    label: 'New File',
    mode: 'python',
    contentType: 'ace-pane',
    id: cid(),
    keyBindings: local.get('aceKeyBindings') || 'default',
    tabSpaces: _.toNumber(local.get('aceTabSpaces')) || 4,
    icon: 'file-code-o',
    closeable: true,
    fontSize: _.toNumber(local.get('fontSize')) || 12,
    theme: 'chrome'
  };
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  const groupId = action.groupId,
    groupIndex = _.findIndex(state, {groupId}),
    newItem = getDefault();

  if (action.filename) {
    newItem.filename = action.filename;
    newItem.label = _.last(action.filename.split(/[\\\/]/));

    if (action.stats) {
      newItem.stats = action.stats;
    }
  }

  state = state.updateIn([groupIndex, 'tabs'], tabs => {
    return tabs.push(newItem);
  });

  state = state.setIn([groupIndex, 'active'], newItem.id);

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function remove(state, action) {
  state = _.cloneDeep(state);
  let group = _.head(state),
    items = group.items,
    targetIndex = _.findIndex(items, {id: action.id}),
    targetItem = items[targetIndex];

  // only allow removal if they have more than one item
  if (targetItem && items.length > 1) {
    items = _.pull(items, targetItem);

    if (group.active === targetItem.id) {
      if (targetIndex === 0 && items[0]) {
        group.active = items[0].id;
      } else {
        group.active = items[targetIndex - 1].id;
      }
    }
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function closeActive(state, action) {
  const items = _.head(state).items,
    focusIndex = _.findIndex(items, {hasFocus: true}),
    focusItem = items[focusIndex];

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
  const items = _.head(state).items,
    focusIndex = _.findIndex(items, {hasFocus: true}),
    focusItem = items[focusIndex],
    newFocusIndex = focusIndex + move,
    newFocusItem = items[newFocusIndex];

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

  const items = _.head(state).items;

  _.each(items, (item) => _.set(item, propertyName, value));

  return state;
}

function fileSaved(state, action) {
  state = _.cloneDeep(state);

  const items = _.head(state).items,
    focusedAce = state && _.find(items, {hasFocus: true});

  focusedAce.filename = action.filename;
  focusedAce.label = _.last(action.filename.split(/[\\\/]/));

  return state;
}

function changePreference(state, action) {
  switch (action.key) {
    case 'fontSize': return changeProperty(state, 'fontSize', action.value, _.toNumber);
    case 'aceTabSpaces': return changeProperty(state, 'tabSpaces', action.value, _.toNumber);
    case 'aceKeyBindings': return changeProperty(state, 'keyBindings', action.value);
    default: return state;
  }
}

export default mapReducers({
  ADD_TAB: add,
  CLOSE_FILE: remove,
  FOCUS_TAB: commonTabsReducers.focus,
  FILE_IS_SAVED: fileSaved,
  CLOSE_ACTIVE_FILE: closeActive,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1),
  CHANGE_PREFERENCE: changePreference
}, initialState);
