/**
 * Why have a separate file?
 *
 * Sometimes we want to do something _without_ visual indicators
 */

import _ from 'lodash';
import api from '../services/api';

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
 * @param {object} action
 * @returns {Promise}
 */
function shareAction(action) {
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

  // Only share actions that are meant to be shared
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
