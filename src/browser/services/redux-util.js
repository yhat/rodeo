import _ from 'lodash';
import path from 'path';

/**
 * @param {string} filename
 * @returns {string}
 * @example const typePrefix = fromFilenameToPrefix(__filename);
 */
function fromFilenameToPrefix(filename) {
  let name = path.parse(filename).name.split('.')[0];

  return toConstantCase(name) + '_';
}

function toConstantCase(str) {
  return _.toUpper(_.snakeCase(str));
}

function addPrefixToKeys(prefix, obj) {
  return _.reduce(obj, (newObj, value, key) => {
    newObj[prefix + key] = value;

    return newObj;
  }, {});
}

function convertKeysToConstantCase(obj) {
  return _.reduce(obj, (newObj, value, key) => {
    newObj[key] = toConstantCase(value);

    return newObj;
  }, {});
}

/**
 * Scope each reducer to within xpath
 * @param {[string]} xpath
 * @param {object} reducerMap
 * @returns {object}
 */
function scopeReducer(xpath, reducerMap) {
  return _.mapValues(reducerMap, (fn) => {
    return (state, action) => _.set(state, xpath, fn(_.get(xpath, state), action));
  });
}

/**
 * @param {object} state
 * @param {object} action
 * @param {function} reducer
 * @param {[string]} xpath
 * @returns {object}
 */
function reduceChildState(state, action, reducer, xpath) {
  const targetState = _.get(state, xpath),
    newTargetState = targetState && reducer(targetState, action);

  if (targetState && newTargetState !== state) {
    state = state.setIn(xpath, newTargetState);
  }

  return state;
}

/**
 * Scope each reducer to within the content of a tab
 * @param {string} contentType
 * @param {function} reducer
 * @returns {function}
 */
function tabReducer(contentType, reducer) {
  return function (state, action) {
    const groups = state;

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];

      if (action.groupId === group.groupId || action.groupId === undefined) {
        const tabs = group.tabs;

        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
          const tab = tabs[tabIndex];

          if (tab.contentType === contentType && (action.id === tab.id || action.id === undefined)) {
            const xpath = [groupIndex, 'tabs', tabIndex, 'content'];

            state = reduceChildState(state, action, reducer, xpath);
          }
        }
      }
    }

    return state;
  };
}

function dialogReducer(contentType, reducer) {
  return function (state, action) {
    const items = state.items;

    if (_.isArray(items)) {
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const dialog = items[itemIndex];

        if (dialog.contentType === contentType) {
          const xpath = ['items', itemIndex, 'content'];

          state = reduceChildState(state, action, reducer, xpath);
        }
      }
    }

    return state;
  };
}

/**
 * @param {...function} reducers
 * @return {function}
 * @see https://github.com/acdlite/reduce-reducers/blob/master/src/index.js
 */
function reduceReducers(...reducers) {
  return function (state, action) {
    return reducers.reduce((state, reducer) => reducer(state, action), state);
  };
}

export default {
  addPrefixToKeys,
  convertKeysToConstantCase,
  dialogReducer,
  fromFilenameToPrefix,
  reduceReducers,
  scopeReducer,
  tabReducer,
  toConstantCase
};
