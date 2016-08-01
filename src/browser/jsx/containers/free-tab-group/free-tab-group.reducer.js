import _ from 'lodash';
import cid from '../../services/cid';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabsReducers from '../../services/common-tabs-reducers';

const initialState = Immutable.from([]);

/**
 * Focus the tab that has a certain plot in it
 * @param {object} state
 * @returns {object}
 */
function focusPlot(state) {
  return state;
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
    removedItems = fromGroup && fromGroupItemIndex !== -1 && fromGroup.items.splice(fromGroupItemIndex, 1);

  if (!toGroup) {
    return oldState;
  }

  toGroup.items = toGroup.items.concat(removedItems);

  // dragged item takes focus in the new location
  toGroup.active = action.id;

  // if moving to new group and item had focus, move focus to left item
  if (toGroup !== fromGroup && removedItems && removedItems.length && removedItems[0].id === fromGroup.active) {
    if (fromGroupItemIndex === 0 && fromGroup.items.length) {
      fromGroup.active = fromGroup.items[0].id;
    } else if (fromGroup.items[fromGroupItemIndex - 1]) {
      fromGroup.active = fromGroup.items[fromGroupItemIndex - 1].id;
    }
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  return commonTabsReducers.addItem(state, action, _.omit(action, 'type'));
}

/**
 * Add new plot to _every_ plot viewer
 * @param {Immutable} state
 * @param {object} action
 * @param {object|string} action.data
 * @returns {immutable.List}
 */
function addPlot(state, action) {
  _.each(state, (group, groupIndex) => {
    _.each(group.tabs, (tab, tabIndex) => {
      if (tab.contentType === 'plot-viewer') {
        state = state.updateIn([groupIndex, 'tabs', tabIndex, 'options'], obj => {
          const newPlot = {
            id: cid(),
            data: action.data,
            createdAt: new Date().getTime()
          };

          obj.active = newPlot.id;
          obj.plots.push(newPlot);
          return obj;
        });
      }
    });
  });

  return state;
}

export default mapReducers({
  CLOSE_TAB: commonTabsReducers.close,
  ADD_TAB: add,
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: commonTabsReducers.focus,
  MOVE_TAB: moveTab,
  IOPUB_DATA_DISPLAYED: addPlot
}, initialState);
