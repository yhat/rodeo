import _ from 'lodash';
import AcePane from './ace-pane.jsx';
import cid from '../../services/cid';

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

  if (!focusItem.filename && focusIndex === 0 && state.length === 1) {
    state = [];
  } else {
    focusItem.hasFocus = false;
  }

  state.push(newItem);

  return state;
}

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

function splitPaneDrag(state) {
  refreshPanes();
  return state;
}

function hasChanges(state, action) {
  state = _.clone(state);
  const targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  targetItem.hasUnsavedChanges = true;

  return state;
}

function save(state, action) {
  state = _.clone(state);
  const targetIndex = _.findIndex(state, {id: action.id}),
    targetItem = state[targetIndex];

  targetItem.hasUnsavedChanges = false;

  return state;
}

function closeActive(state, action) {
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex];

  return remove(state, _.assign({id: focusItem.id}, action));
}

function shiftFocus(state, action) {
  state = _.clone(state);
  const focusIndex = _.findIndex(state, {hasFocus: true}),
    focusItem = state[focusIndex],
    newFocusIndex = focusIndex + action.move,
    newFocusItem = state[newFocusIndex];

  if (newFocusItem) {
    focusItem.hasFocus = false;
    newFocusItem.hasFocus = true;
  }

  return state;
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'ADD_FILE': return add(state, action);
    case 'CLOSE_FILE': return remove(state, action);
    case 'FOCUS_FILE': return focus(state, action);
    case 'FILE_IS_SAVED': return save(state, action);
    case 'FILE_HAS_CHANGES': return hasChanges(state, action);
    case 'CLOSE_ACTIVE_FILE': return closeActive(state, action);
    case 'SPLIT_PANE_DRAG': return splitPaneDrag(state, action);
    case 'MOVE_ONE_RIGHT': return shiftFocus(state, _.assign({move: +1}, action));
    case 'MOVE_ONE_LEFT': return shiftFocus(state, _.assign({move: -1}, action));
    default: return state;
  }
}