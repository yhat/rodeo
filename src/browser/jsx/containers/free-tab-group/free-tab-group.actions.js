/**
 * @param {[object]} groups
 * @param {string} tabId
 * @returns {string|undefined}
 */
function findGroupIdByTabId(groups, tabId) {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i],
      items = group.items;

    for (let j = 0; j < items.length; j++) {
      const item = items[j];

      if (item.id === tabId) {
        return group.groupId;
      }
    }
  }
}

/**
 * Any focus on the tab should redirect the focus to the contents.
 * @param {string} groupId
 * @param {string} id
 * @returns {object};
 */
function focusTab(groupId, id) {
  return {type: 'FOCUS_TAB', groupId, id};
}

/**
 * Finds the first tab of a certain type in ANY group, and focuses it.
 * @param {string} contentType
 * @returns {object|undefined}
 */
function focusFirstTabByType(contentType) {
  return function (dispatch, getState) {
    const state = getState(),
      groups = state.freeTabGroups;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i],
        items = group.items;

      for (let j = 0; j < items.length; j++) {
        const item = items[j];

        if (item.contentType === contentType) {
          return dispatch(focusTab(group.groupId, item.id));
        }
      }
    }
  };
}

/**
 * @param {string} toGroupId
 * @param {string} id
 * @returns {function}
 */
function moveTab(toGroupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      groups = state.freeTabGroups,
      fromGroupId = findGroupIdByTabId(groups, id);

    dispatch({type: 'MOVE_TAB', toGroupId, fromGroupId, id});
  };
}

export default {
  focusTab,
  focusFirstTabByType,
  moveTab
};
