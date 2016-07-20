/**
 * Why have a separate file?
 *
 * Sometimes we want to do something _without_ visual indicators
 */

import {send} from 'ipc';

function checkForUpdates() {
  return send('checkForUpdates');
}

function toggleDevTools() {
  return send('toggleDevTools');
}

function quitAndInstall() {
  return send('quitAndInstall');
}

function quit() {
  return send('quitApplication');
}

/**
 *
 * @param {string} name
 * @param {object} options
 * @returns {Promise}
 */
function createWindow(name, options) {
  return send('createWindow', name, options);
}

/**
 * @param {object} action
 * @returns {Promise}
 */
function shareAction(action) {
  // only share action if we're the original creator
  if (!action.senderName) {
    return send('shareAction', action);
  }
}

export default {
  checkForUpdates,
  createWindow,
  shareAction,
  toggleDevTools,
  quitAndInstall,
  quit
};
