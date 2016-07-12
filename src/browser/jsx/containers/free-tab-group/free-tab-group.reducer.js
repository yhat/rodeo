import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

const initialState = [];

function updateIn(state, list, fn) {
  list = _.clone(list);
  let stateClone = _.clone(state),
    cursor = stateClone,
    key = list.shift(),
    target;

  while (list.length) {
    cursor[key] = _.clone(cursor[key]);
    cursor = cursor[key];
    key = list.shift();
  }
  target = _.clone(cursor[key]);
  cursor[key] = fn(target) || target;

  return stateClone;
}

/**
 * @param {Array} items
 */
function removeFocusFromAll(items) {
  _.each(items, function (item) {
    item.hasFocus = false;
  });
}

/**
 * Focus the tab that has a certain plot in it
 * @param {object} state
 * @returns {object}
 */
function focusPlot(state) {
  return state;
}

function focusTab(state, action) {
  const groupId = action.groupId,
    groupIndex = _.findIndex(state, {groupId}),
    group = state[groupIndex],
    items = group && group.items,
    targetIndex = _.findIndex(items, {id: action.id}),
    targetItem = targetIndex && items && items[targetIndex];

  if (!targetItem || targetItem.hasFocus) {
    return state;
  }

  return updateIn(state, [groupIndex, 'items'], function (items) {
    let focusIndex = _.findIndex(items, {hasFocus: true}),
      focusItem = items[focusIndex],
      targetIndex = _.findIndex(items, {id: action.id}),
      targetItem = items[targetIndex];

    targetItem.hasFocus = true;
    if (focusItem) {
      focusItem.hasFocus = false;
    }
  });
}
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
    fromGroupItemIndex = fromGroup && _.findIndex(fromGroup.items, {id: action.id}),
    removedItems = fromGroup && fromGroup.items.splice(fromGroupItemIndex, 1);

  if (!toGroup) {
    return oldState;
  }

  toGroup.items = toGroup.items.concat(removedItems);

  // dragged item takes focus in the new location
  toGroup.items = toGroup.items.map(function (item) {
    item.hasFocus = item.id === action.id;
    return item;
  });

  // if moving to new group and item had focus, move focus to left item
  if (toGroup !== fromGroup && removedItems && removedItems.length && removedItems[0].hasFocus) {
    if (fromGroupItemIndex === 0 && fromGroup.items.length) {
      fromGroup.items[0].hasFocus = true;
    } else if (fromGroup.items[fromGroupItemIndex - 1]) {
      fromGroup.items[fromGroupItemIndex - 1].hasFocus = true;
    }
  }

  return state;
}

/**
 * @param {object} oldState
 * @param {object} action
 * @returns {object}
 */
function createTab(oldState, action) {
  const state = _.cloneDeep(oldState);
  let group = state[_.findIndex(state, {groupId: action.groupId})];

  if (!group) {
    group = _.head(state);
  }

  if (group) {
    const item = _.omit(action, 'type');

    if (item.hasFocus) {
      removeFocusFromAll(group.items);
    }

    group.items.push(item);
  }

  return state;
}

/**
 * @param {object} oldState
 * @param {object} action
 * @returns {object}
 */
function closeTab(oldState, action) {
  const state = _.cloneDeep(oldState);
  let groupIndex = _.findIndex(state, {groupId: action.groupId}),
    group = state[groupIndex],
    itemIndex = group && _.findIndex(group.items, {id: action.id});

  if (groupIndex > -1 && itemIndex > -1) {
    const item = _.find(group.items, {id: action.id});

    if (item.hasFocus && group.items.length > 1) {
      if (itemIndex === 0) {
        group.items[1].hasFocus = true;
      } else {
        group.items[itemIndex - 1].hasFocus = true;
      }
    }

    _.pull(group.items, item);
  }

  return state;
}

export default mapReducers({
  CLOSE_TAB: closeTab,
  CREATE_TAB: createTab,
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: focusTab,
  MOVE_TAB: moveTab
}, initialState);
