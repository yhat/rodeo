import _ from 'lodash';
import cid from '../../services/cid';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabReducers from '../../services/common-tabs-reducers';

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

    if (item.id === group.active && group.items.length > 1) {
      if (itemIndex === 0) {
        group.active = group.items[1].id;
      } else {
        group.active = group.items[itemIndex - 1].id;
      }
    }

    _.pull(group.items, item);
  }

  return state;
}

/**
 * Create a new plot
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
  CLOSE_TAB: closeTab,
  CREATE_TAB: createTab,
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: commonTabReducers.focus,
  MOVE_TAB: moveTab,
  IOPUB_DATA_DISPLAYED: addPlot
}, initialState);
