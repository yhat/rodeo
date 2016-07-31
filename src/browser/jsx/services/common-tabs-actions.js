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

export default {
  findGroupIdByTabId
};
