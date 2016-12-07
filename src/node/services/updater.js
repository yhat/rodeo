'use strict';

import bluebird from 'bluebird';
import electron from 'electron';
import browserWindows from './browser-windows';
import promises from './promises';

const log = require('./log').asInternal(__filename);

/**
 * @param {string} type
 * @param {*} data
 * @returns {Promise}
 */
function dispatch(type, data) {
  log('info', 'dispatch', {type, data});
  return browserWindows.send('mainWindow', 'dispatch', {type, data, meta: {sender: 'self'}});
}

/**
 * @param {string} currentVersion
 * @returns {string}
 */
function getUpdateUrl(currentVersion) {
  const hostname = 'http://bareback.s.yhat.com';

  if (process.platform === 'darwin') {
    return hostname + `/update/osx/${currentVersion}`;
  } else if (process.platform === 'win32') {
    return hostname + `/update/win32/${currentVersion}`;
  }
}

/**
 * @param {string} currentVersion
 * @returns {Promise}
 */
function update(currentVersion) {
  return bluebird.try(function () {
    log('info', 'checking for updates for', currentVersion);

    const autoUpdater = electron.autoUpdater,
      updateUrl = getUpdateUrl(currentVersion);

    if (updateUrl) {
      /* eslint max-params: ["error", 6] */
      autoUpdater.on('update-downloaded', (evt, notes, name, date, url) => dispatch('AUTO_UPDATE_DOWNLOADED', {notes, name, date, url}));
      autoUpdater.on('error', (error) => dispatch('AUTO_UPDATE_ERROR', error.message));
      autoUpdater.on('update-available', () => dispatch('AUTO_UPDATE_AVAILABLE'));
      autoUpdater.on('update-not-available', () => dispatch('AUTO_UPDATE_NOT_AVAILABLE'));
      log('info', 'check for update at', updateUrl);

      let promise =  promises.eventsToPromise(autoUpdater, {
        resolve: ['update-available', 'update-not-available'],
        resolveTransform: (data, name) => name,
        reject: ['error']
      });

      autoUpdater.setFeedURL(updateUrl);
      autoUpdater.checkForUpdates();

      return promise;
    }
  });
}

/**
 * Install updates
 */
function install() {
  electron.autoUpdater.quitAndInstall();
}

module.exports.update = update;
module.exports.install = install;
