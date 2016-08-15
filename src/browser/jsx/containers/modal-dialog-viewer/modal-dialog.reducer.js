/**
 *
 * Modals work on a stack.  A modal that triggers another modal is stacking on top, such that cancelling the top modal
 * returns to the first.
 * @module
 */

import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

const initialState = [];

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function add(state, action) {
  state = _.clone(state);
  const modal = _.assign({
    id: cid()
  }, _.omit(action, ['type']));

  state.push(modal);

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function cancel(state, action) {
  const top = _.last(state);

  if (top.id === action.id) {
    state = _.clone(state);
    state.pop();
  }

  return state;
}

/**
 * @returns {Array}
 */
function cancelAll() {
  return [];
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function ok(state, action) {
  const top = _.last(state);

  if (top.id === action.id) {
    state = _.clone(state);
    state.pop();
  }

  return state;
}

export default mapReducers({
  ADD_MODAL_DIALOG: add,
  CANCEL_MODAL_DIALOG: cancel,
  CANCEL_ALL_MODAL_DIALOGS: cancelAll,
  OK_MODAL_DIALOG: ok
}, initialState);
