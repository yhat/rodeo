import _ from 'lodash';
import AcePane from '../../components/ace-pane/ace-pane.jsx';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';
import store from '../../services/store';
import initialStory from 'raw!./initial-story.py';

const refreshPanes = _.throttle(() => AcePane.resizeAll(), 50),
  initialState = [{groupId: 'top-left', items: [getFirst()]}];

function getFirst() {
  const first = getDefault();

  first.initialValue = initialStory;

  return first;
}

function getDefault() {
  return {
    label: 'New File',
    mode: 'python',
    contentType: 'ace-pane',
    id: cid(),
    tabId: cid(),
    hasFocus: true,
    keyBindings: store.get('aceKeyBindings') || 'default',
    tabSpaces: _.toNumber(store.get('aceTabSpaces')) || 4,
    icon: 'file-code-o',
    isCloseable: true,
    fontSize: _.toNumber(store.get('fontSize')) || 12,
    theme: 'chrome'
  };
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  state = _.cloneDeep(state);
  let items = _.head(state).items,
    focusIndex = _.findIndex(items, {hasFocus: true}),
    focusItem = items[focusIndex],
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

  items.push(newItem);

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function remove(state, action) {
  state = _.cloneDeep(state);
  let items = _.head(state).items,
    targetIndex = _.findIndex(items, {id: action.id}),
    targetItem = items[targetIndex];

  // only allow removal if they have more than one item
  if (targetItem && items.length > 1) {
    items = _.pull(items, targetItem);

    if (targetItem.hasFocus) {
      if (targetIndex === 0 && items[0]) {
        items[0].hasFocus = true;
      } else {
        items[targetIndex - 1].hasFocus = true;
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
  state = _.cloneDeep(state);
  const items = _.head(state).items,
    focusIndex = _.findIndex(items, {hasFocus: true}),
    focusItem = items[focusIndex],
    targetIndex = _.findIndex(items, {id: action.id}),
    targetItem = items[targetIndex];

  if (targetItem.hasFocus) {
    return state;
  } else {
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
  ADD_FILE: add,
  CLOSE_FILE: remove,
  FOCUS_FILE: focus,
  FILE_IS_SAVED: fileSaved,
  CLOSE_ACTIVE_FILE: closeActive,
  SPLIT_PANE_DRAG: splitPaneDrag,
  MOVE_ONE_RIGHT: _.partialRight(shiftFocus, +1),
  MOVE_ONE_LEFT: _.partialRight(shiftFocus, -1),
  CHANGE_PREFERENCE: changePreference
}, initialState);
