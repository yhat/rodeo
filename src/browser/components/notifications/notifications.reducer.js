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
  }, action);

  state.push(modal);

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function close(state, action) {
  const target = _.find(state, {id: action.notification.id});

  if (target) {
    state = _.clone(state);
    state = _.without(state, target);
  }

  return state;
}

/**
 * @returns {Array}
 */
function closeAll() {
  return [];
}

function showStaticMessage(content) {
  return function (state) {
    return add(state, {content});
  };
}

function showUpdateDownloaded(state, action) {
  return add(state, action);
}

export default mapReducers({
  ADD_NOTIFICATION: add,
  CLOSE_NOTIFICATION: close,
  CLOSE_ALL_NOTIFICATIONS: closeAll,
  AUTO_UPDATE_DOWNLOADED: showUpdateDownloaded,
  CHECKED_FOR_UPDATE_DOWNLOAD_AVAILABLE: showStaticMessage('An update for Rodeo is available!'),
  CHECK_FOR_UPDATE_FAILED: showStaticMessage('Unable to check for updates.'),
  CHECKED_FOR_UPDATE_DOWNLOAD_NOT_AVAILABLE: showStaticMessage('Rodeo has all the latest updates!')
}, initialState);
