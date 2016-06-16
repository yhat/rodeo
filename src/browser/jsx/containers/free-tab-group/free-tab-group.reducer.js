import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

const initialState = [
  {
    groupId: 'top-right',
    items: [
      {
        contentType: 'variable-viewer',
        icon: 'table',
        label: 'Environment',
        tabId: cid(),
        id: cid()
      },
      {
        contentType: 'history-viewer',
        icon: 'history',
        label: 'History',
        tabId: cid(),
        id: cid()
      }
    ]
  },
  {
    groupId: 'bottom-right',
    items: [
      {
        contentType: 'file-viewer',
        icon: 'file-text-o',
        label: 'Files',
        tabId: cid(),
        id: cid()
      },
      {
        contentType: 'plot-viewer',
        icon: 'bar-chart',
        label: 'Plots',
        tabId: cid(),
        id: cid()
      },
      {
        contentType: 'package-viewer',
        icon: 'archive',
        label: 'Packages',
        tabId: cid(),
        id: cid()
      }
    ]
  }
];

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
    items = group.items,
    targetIndex = _.findIndex(items, {id: action.id}),
    targetItem = targetIndex && items[targetIndex];

  if (targetItem.hasFocus) {
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
 * @param {object} state
 * @param {object} action
 * @param {string} action.toGroupId
 * @param {string} action.fromGroupId
 * @param {string} action.id
 * @returns {object}
 */
function moveTab(state, action) {
  state = _.cloneDeep(state);
  const toGroup = state[_.findIndex(state, {groupId: action.toGroupId})],
    fromGroup = state[_.findIndex(state, {groupId: action.fromGroupId})],
    fromGroupItemIndex = _.findIndex(fromGroup.items, {id: action.id}),
    removedItems = fromGroup.items.splice(fromGroupItemIndex, 1);

  toGroup.items = toGroup.items.concat(removedItems);

  // dragged item takes focus in the new location
  toGroup.items = toGroup.items.map(function (item) {
    item.hasFocus = item.id === action.id;
    return item;
  });

  // if moving to new group and item had focus, move focus to left item
  if (toGroup !== fromGroup && removedItems.length && removedItems[0].hasFocus) {
    if (fromGroupItemIndex === 0 && fromGroup.items.length) {
      fromGroup.items[0].hasFocus = true;
    } else if (fromGroup.items[fromGroupItemIndex - 1]) {
      fromGroup.items[fromGroupItemIndex - 1].hasFocus = true;
    }
  }

  return state;
}

export default mapReducers({
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: focusTab,
  MOVE_TAB: moveTab
}, initialState);
