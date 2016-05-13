/**
 *
 * Modals work on a stack.  A modal that triggers another modal is stacking on top, such that cancelling the top modal
 * returns to the first.
 * @module
 */

import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

const initialState = {
  isExpanded: false
};

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function showURL(state, action) {
  state = _.clone(state);

  if (!state.isExpanded) {
    state = _.clone(state);
    state.isExpanded = true;
    state.url = action.url;
  } else if (state.isExpanded && state.url !== action.url) {
    state = _.clone(state);
    state.url = action.url;
  } else if (state.isExpanded && state.url === action.url) {
    // close like a toggle
    state = _.clone(state);
    state.isExpanded = false;
  }

  return state;
}

/**
 * @param {Array} state
 * @returns {Array}
 */
function hide(state) {
  state = _.clone(state);
  state.isExpanded = false;

  return state;
}

export default mapReducers({
  SHOW_URL_IN_SIDEBAR: showURL,
  HIDE_URL_IN_SIDEBAR: hide
}, initialState);
