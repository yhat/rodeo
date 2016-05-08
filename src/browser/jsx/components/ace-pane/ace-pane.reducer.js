import _ from 'lodash';
import AcePane from './ace-pane.jsx';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

const refreshPanes = _.throttle(() => AcePane.resizeAll(), 50),
  initialState = [getDefault()];

function getDefault() {
  return {
    label: 'New File',
    mode: 'python',
    id: cid(),
    tabId: cid(),
    hasFocus: true,
    keyBindings: 'default',
    icon: 'file-code-o',
    isCloseable: true,
    fontSize: 12,
    theme: 'chrome'
  };
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  state = _.clone(state);
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex],
    newItem = getDefault();

  if (action.filename) {
    newItem.filename = action.filename;
    newItem.label = _.last(action.filename.split(/[\\\/]/));

    if (action.stats) {
      newItem.stats = action.stats;
    }
  }

  // focus changed to new file

  if (focusItem) {
    focusItem.hasFocus = false;
  }

  state.push(newItem);

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function remove(state, action) {
  state = _.clone(state);
  const targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  if (targetItem) {
    state = _.without(state, targetItem);

    if (targetItem.hasFocus) {
      if (targetIndex === 0 && state[0]) {
        state[0].hasFocus = true;
      } else {
        state[targetIndex - 1].hasFocus = true;
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
function focus(state, action) {
  state = _.clone(state);
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex],
    targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  if (targetItem.hasFocus) {
    return state;
  } else {
    state = _.clone(state);
    targetItem.hasFocus = true;
    focusItem.hasFocus = false;
    return state;
  }
}

/**
 * @param {Array} state
 * @returns {Array}
 */
function splitPaneDrag(state) {
  refreshPanes();
  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function hasChanges(state, action) {
  state = _.clone(state);
  const targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  targetItem.hasUnsavedChanges = true;

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function save(state, action) {
  state = _.clone(state);
  const targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  targetItem.hasUnsavedChanges = false;

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function closeActive(state, action) {
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex];

  return remove(state, _.assign({id: focusItem.id}, action));
}

/**
 * @param {Array} state
 * @param {object} action
 * @param {number} move
 * @returns {Array}
 */
function shiftFocus(state, action, move) {
  state = _.clone(state);
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex],
    newFocusIndex = focusIndex + move,
    newFocusItem = state[newFocusIndex];

  if (newFocusItem) {
    focusItem.hasFocus = false;
    newFocusItem.hasFocus = true;
  }

  return state;
}

export default mapReducers({
  ADD_FILE: add,
  CLOSE_FILE: remove,
  FOCUS_FILE: focus,
  FILE_IS_SAVED: save,
  FILE_HAS_CHANGES: hasChanges,
  CLOSE_ACTIVE_FILE: closeActive,
  SPLIT_PANE_DRAG: splitPaneDrag,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1)
}, initialState);
