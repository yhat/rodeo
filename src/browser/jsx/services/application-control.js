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

export default {
  checkForUpdates,
  toggleDevTools,
  quitAndInstall,
  quit
};
