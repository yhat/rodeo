import _ from 'lodash';
import dateUtil from '../../shared/dateUtil';
import immutableUtil from './immutable-util';

/**
 * Special Initialization Case:  When groupId is null and there is no sender, assume they meant the first group available
 * @param {Array} state
 * @param {object} action
 * @param {object} item
 * @returns {Array}
 */
function addItem(state, action, item) {
  const isInitializationCase = state.length > 0 && action.groupId === null && !action.senderName,
    groupId = isInitializationCase ? state[0].groupId : action.groupId,
    groupIndex = _.findIndex(state, {groupId});

  if (groupIndex > -1) {
    state = immutableUtil.pushAtPath(state, [groupIndex, 'tabs'], item);
    state = state.setIn([groupIndex, 'active'], item.id);
  }

  return state;
}

/**
 * @param {Immutable} state
 * @param {object} action
 * @returns {Immutable}
 */
function focus(state, action) {
  const groupId = action.groupId,
    groupIndex = _.findIndex(state, {groupId});

  // if we own the group
  if (groupIndex !== -1) {
    const id = action.id,
      tabIndex = _.findIndex(state[groupIndex].tabs, {id});

    if (tabIndex !== -1) {
      state = state.setIn([groupIndex, 'active'], id);
      state = state.setIn([groupIndex, 'tabs', tabIndex, 'lastFocused'], dateUtil.getCurrentTime());
    }
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function close(state, action) {
  const groupId = action.groupId,
    id = action.id,
    groupIndex = _.findIndex(state, {groupId});

  if (groupIndex > -1) {
    const tabs = state[groupIndex].tabs,
      tabIndex = _.findIndex(state[groupIndex].tabs, {id});

    // only allow removal if they have more than one item
    if (tabs.length > 1) {
      state = immutableUtil.removeAtPath(state, [groupIndex, 'tabs'], tabIndex);

      if (state[groupIndex].active === id) {
        let newActive;

        if (tabIndex === 0 && tabs[1]) {
          newActive = tabs[1].id;
        } else {
          newActive = tabs[tabIndex - 1].id;
        }

        state = state.setIn([groupIndex, 'active'], newActive);
      }
    }
  }

  return state;
}

function closeActive(state, action) {
  const groupId = action.groupId,
    groupIndex = _.findIndex(state, {groupId});

  if (groupIndex > -1) {
    state = close(state, _.assign({id: state[groupIndex].active}, action));
  }

  return state;
}

/**
 * @param {Immutable} state
 * @param {string} propertyName
 * @param {*} value
 * @param {function} [transform]
 * @returns {object}
 */
function changeProperty(state, propertyName, value, transform) {
  if (transform) {
    value = transform(value);
  }

  _.each(state, (group, groupIndex) => {
    _.each(group.tabs, (tab, tabIndex) => {
      state = state.setIn([groupIndex, 'tabs', tabIndex, 'content', propertyName], value);
    });
  });

  return state;
}

function getGroupIndex(state, action) {
  // if we have a groupId, find it
  if (_.isString(action.groupId)) {
    const groupId = action.groupId;

    return _.findIndex(state, {groupId});
  }

  // if we have at least one item, use the first item
  if (_.isArray(state) && state.length) {
    return 0;
  }

  // no groups available here
  return -1;
}

function eachTabByAction(state, action, fn) {
  _.each(state, (group, groupIndex) => {
    if (action.groupId === group.groupId || action.groupId === undefined) {
      _.each(group.tabs, (tab, tabIndex) => {
        if (action.id === tab.id || action.id === undefined) {
          const cursor = {group, groupIndex, tab, tabIndex};

          fn(tab, cursor);
        }
      });
    }
  });
}

function eachTabByActionAndContentType(state, action, contentType, fn) {
  return eachTabByAction(state, action, function (tab, cursor) {
    if (tab.contentType === contentType) {
      return fn(tab, cursor);
    }
  });
}

function convertItemPathToIndexPath(items, itemPath) {
  let item, itemIndex, indexPath = [];

  for (let i = 0; i < itemPath.length; i++) {
    item = itemPath[i];
    itemIndex = _.findIndex(items, {cid: item.cid});

    if (itemIndex <= -1) {
      return null;
    }

    indexPath.push(itemIndex);
    items = items[itemIndex].items;

    // if not the last item in the list, add 'items'
    if (i < itemPath.length - 1) {
      indexPath.push('items');
    }
  }

  return indexPath;
}

export default {
  addItem,
  close,
  closeActive,
  eachTabByAction,
  eachTabByActionAndContentType,
  focus,
  changeProperty,
  convertItemPathToIndexPath,
  getGroupIndex
};
