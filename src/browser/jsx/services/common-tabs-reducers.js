import _ from 'lodash';

/**
 * @param {Immutable} state
 * @param {Action} action
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
    }
  }

  return state;
}

export default {
  focus
};
