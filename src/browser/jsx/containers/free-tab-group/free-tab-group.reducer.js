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


export default mapReducers({
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: focusTab
}, initialState);
