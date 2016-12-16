/**
 * Why have a separate file?
 *
 * Sometimes we want to do something _without_ visual indicators
 */

import _ from 'lodash';
import api from '../services/api';
import track from '../services/track';

function checkForUpdates() {
  return api.send('checkForUpdates');
}

function toggleDevTools() {
  return api.send('toggleDevTools');
}

function quitAndInstall() {
  return api.send('quitAndInstall');
}

function quit() {
  return api.send('quitApplication');
}

/**
 *
 * @param {string} name
 * @param {object} options
 * @returns {Promise}

 */
function createWindow(name, options) {
  return api.send('createWindow', name, options);
}

/**
 * If this action is marked as trackable, track it
 * We will use this to see if new features are actually used, or break horribly.  Users can always
 * turn tracking off as well.
 * @param {object} action
 */
function trackRedux(action) {
  // If this action is marked as trackable, track it
  // We will use this to see if new features are actually used, or break horribly.  Users can always
  // turn tracking off as well.
  if (action.type && action.meta && action.meta.track) {
    let label;

    if (action.error === true && action.payload) {
      label = action.payload.message || action.payload.name || 'UnnamedError';
    } else if (action.meta.track !== true) {
      label = action.meta.track;
    }

    track(_.pickBy({category: 'redux', action: action.type, label, value: 1}, _.identity));
  }
}

/**
 * NOTE: If this action has a payload, only log that.  The rest is nonsense.
 * NOTE: Logs are removed in production.
 * @param {object} action
 */
function logRedux(action) {
  const type = action.type;

  if (action.payload) {
    const payload = action.payload;

    if (action.error === true) {
      console.error(type, payload);
    } else {
      console.log(type, payload);
    }
  } else {
    console.log(type, action);
  }
}

/**
 * @param {object} action
 * @returns {Promise}
 */
function shareAction(action) {
  trackRedux(action);
  logRedux(action);

  // Only share actions that are meant to be shared between windows
  // No sender means default behavior (therefore shareable)
  if (!(action.meta && action.meta.sender) && !_.startsWith(action.type, '@@redux')) {
    return api.send('shareAction', action);
  }
}

function surveyTabs() {
  return api.send('surveyTabs');
}

function showStartupWindow() {
  return api.send('showStartupWindow');
}

export default {
  checkForUpdates,
  createWindow,
  shareAction,
  showStartupWindow,
  surveyTabs,
  toggleDevTools,
  quitAndInstall,
  quit
};
