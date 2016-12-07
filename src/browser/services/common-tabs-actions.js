import _ from 'lodash';

/**
 * @param {[object]} groups
 * @param {string} tabId
 * @returns {string|undefined}
 */
function findGroupIdByTabId(groups, tabId) {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i],
      tabs = group.tabs;

    for (let j = 0; j < tabs.length; j++) {
      const tab = tabs[j];

      if (tab.id === tabId) {
        return group.groupId;
      }
    }
  }
}

/**
 * @param {Array} tabGroups
 * @param {number} [groupId]  Uses first group if not provided
 * @returns {object}  Returns -1 if no group found
 */
function getGroupIndex(tabGroups, groupId) {
  if (tabGroups.length === 0) {
    return -1;
  }

  return _.isString(groupId) ? _.findIndex(tabGroups, {groupId}) : 0;
}

/**
 * @param {Array} tabGroups
 * @param {string} groupId
 * @param {string} id
 * @returns {object}
 */
function getContent(tabGroups, groupId, id) {
  const groupIndex = _.findIndex(tabGroups, {groupId});

  if (groupIndex > -1) {
    const tabIndex = _.findIndex(tabGroups[groupIndex].tabs, {id});

    if (tabIndex > -1) {
      return tabGroups[groupIndex].tabs[tabIndex].content;
    }
  }

  return null;
}

/**
 * Note:  Caller must pass null if they want _any_ group
 * @param {string} tabGroupName  ex., freeTabGroups, editorTabGroups
 * @param {function} fn
 * @returns {function}
 */
function toActiveTab(tabGroupName, fn) {
  return function (groupId) {
    const otherArgs = _.slice(arguments, 1);

    return function (dispatch, getState) {
      const state = getState(),
        groupIndex = getGroupIndex(state[tabGroupName], groupId);

      if (groupIndex > -1) {
        groupId = groupId || state[tabGroupName][groupIndex].groupId;
        const active = state[tabGroupName][groupIndex].active;

        return dispatch(fn.apply(null, [groupId, active].concat(otherArgs)));
      }
    };
  };
}

function getActiveTabIndex(tabGroups, groupId) {
  const groupIndex = getGroupIndex(tabGroups, groupId);

  if (groupIndex > -1) {
    const id = tabGroups[groupIndex].active;

    return _.findIndex(tabGroups[groupIndex].tabs, {id});
  }

  return null;
}

function getActiveTab(tabGroups, groupId) {
  const groupIndex = getGroupIndex(tabGroups, groupId);

  if (groupIndex > -1) {
    const id = tabGroups[groupIndex].active,
      activeTabIndex = _.findIndex(tabGroups[groupIndex].tabs, {id});

    if (activeTabIndex > -1) {
      return tabGroups[groupIndex].tabs[activeTabIndex];
    }
  }

  return null;
}

function isTabContentTypeInGroups(contentType, groups) {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex],
      tabs = group && group.tabs;

    if (tabs) {
      for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
        const tab = tabs[tabIndex];

        if (tab.contentType === contentType) {
          return true;
        }
      }
    }
  }

  return false;
}

function isTabContentTypeInWindowList(contentType, windowList, tabGroupName) {
  for (let windowTabsIndex = 0; windowTabsIndex < windowList.length; windowTabsIndex++) {
    const windowTabs = windowList[windowTabsIndex],
      groups = windowTabs && windowTabs[tabGroupName];

    if (groups && isTabContentTypeInGroups(contentType, groups)) {
      return true;
    }
  }
  return false;
}

export default {
  findGroupIdByTabId,
  getGroupIndex,
  getContent,
  getActiveTabIndex,
  getActiveTab,
  isTabContentTypeInGroups,
  isTabContentTypeInWindowList,
  toActiveTab
};
