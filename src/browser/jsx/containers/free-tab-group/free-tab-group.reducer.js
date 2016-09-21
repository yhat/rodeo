import _ from 'lodash';
import cid from '../../services/cid';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabsReducers from '../../services/common-tabs-reducers';
import {local} from '../../services/store';

const initialState = Immutable.from([]),
  maxPlots = 50;

function eachTabByAction(state, action, fn) {
  _.each(state, (group, groupIndex) => {
    if (action.groupId === group.groupId || action.groupId === undefined) {
      _.each(group.tabs, (tab, tabIndex) => {
        if (action.id === tab.id || action.id === undefined) {
          const cursor = {group, groupIndex, tab, tabIndex};

          fn(cursor);
        }
      });
    }
  });
}

/**
 * Focus the tab that has a certain plot in it
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function focusPlot(state, action) {
  eachTabByAction(state, action, (cursor) => {
    if (cursor.tab.contentType === 'plot-viewer') {
      const plots = state[cursor.groupIndex].tabs[cursor.tabIndex].content.plots;

      if (_.find(plots, {id: action.plot.id})) {
        state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], obj => obj.set('active', action.plot.id));
      }
    }
  });

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
    fromGroupItemIndex = fromGroup && _.findIndex(fromGroup.tabs, {id: action.id}),
    removedItems = fromGroup && fromGroupItemIndex !== -1 && fromGroup.tabs.splice(fromGroupItemIndex, 1);

  if (!toGroup) {
    return oldState;
  }

  toGroup.tabs = toGroup.tabs.concat(removedItems);

  // dragged item takes focus in the new location
  toGroup.active = action.id;

  // if moving to new group and item had focus, move focus to left item
  if (toGroup !== fromGroup && removedItems && removedItems.length && removedItems[0].id === fromGroup.active) {
    if (fromGroupItemIndex === 0 && fromGroup.tabs.length) {
      fromGroup.active = fromGroup.tabs[0].id;
    } else if (fromGroup.tabs[fromGroupItemIndex - 1]) {
      fromGroup.active = fromGroup.tabs[fromGroupItemIndex - 1].id;
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
        state = state.updateIn([groupIndex, 'tabs', tabIndex, 'content'], obj => {
          const newPlot = {
              id: cid(),
              data: action.data,
              createdAt: new Date().getTime()
            },
            plots = obj.plots.asMutable();

          plots.unshift(newPlot);

          if (plots.length > maxPlots) {
            plots.pop();
          }

          obj = obj.set('active', newPlot.id);
          obj = obj.merge({plots});

          return obj;
        });
      }
    });
  });

  return state;
}

function removePlot(state, action) {
  eachTabByAction(state, action, (cursor) => {
    if (cursor.tab.contentType === 'plot-viewer') {
      const plots = state[cursor.groupIndex].tabs[cursor.tabIndex].content.plots,
        plotIndex = _.findIndex(plots, {id: action.plot.id});

      if (plotIndex > -1) {
        state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
          const plots = content.plots.asMutable();

          plots.splice(plotIndex, 1);

          return content.merge({plots});
        });
      }
    }
  });

  return state;
}

function variablesChanged(state, action) {
  // put new variables into each environment viewer
  _.each(state, (group, groupIndex) => {
    _.each(group.tabs, (tab, tabIndex) => {
      if (tab.contentType === 'variable-viewer') {
        state = state.setIn([groupIndex, 'tabs', tabIndex, 'content', 'variables'], action.variables);
      }
    });
  });

  // put new dataframes into each data table

  return state;
}

function iopubInputExecuted(state, action) {
  const historyMaxSetting = local.get('terminalHistory'),
    historyMax = historyMaxSetting === null ? 50 : historyMaxSetting;

  if (historyMax > 0 && _.isString(action.text) && action.text.trim().length > 0) {
    // put new history into each history viewer
    _.each(state, (group, groupIndex) => {
      _.each(group.tabs, (tab, tabIndex) => {
        if (tab.contentType === 'history-viewer') {
          state = state.updateIn([groupIndex, 'tabs', tabIndex, 'content'], content => {
            const history = content.history.asMutable();

            history.push({text: action.text});

            if (history.length > historyMax) {
              history.shift();
            }

            return content.merge({history});
          });
        }
      });
    });
  }

  return state;
}

export default mapReducers({
  CLOSE_TAB: commonTabsReducers.close,
  ADD_TAB: add,
  FOCUS_PLOT: focusPlot,
  FOCUS_TAB: commonTabsReducers.focus,
  MOVE_TAB: moveTab,
  IOPUB_DATA_DISPLAYED: addPlot,
  REMOVE_PLOT: removePlot,
  VARIABLES_CHANGED: variablesChanged,
  IOPUB_EXECUTED_INPUT: iopubInputExecuted
}, initialState);
