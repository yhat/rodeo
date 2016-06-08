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

export default {
  focusTab,
  focusFirstTabByType
};
