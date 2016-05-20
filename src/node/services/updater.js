'use strict';

const electron = require('electron'),
  browserWindows = require('./browser-windows'),
  log = require('./log').asInternal(__filename);

/**
 * @param {string} type
 * @param {*} data
 */
function dispatch(type, data) {
  log('info', 'dispatch', type, arguments);
  browserWindows.send('mainWindow', 'dispatch', {type, data});
}

/**
 * @param {string} currentVersion
 * @returns {string}
 */
function getUpdateUrl(currentVersion) {
  let hostname;

  // hostname = 'https://rodeo-updates.yhat.com';
  hostname = 'http://bareback.s.yhat.com';

  if (process.platform === 'darwin') {
    return hostname + `/update/osx/'${currentVersion}`;
  } else if (process.platform === 'win32') {
    return hostname + `/update/win32/${currentVersion}`;
  }
}

/**
 * @param {string} currentVersion
 */
function update(currentVersion) {
  log('info', 'checking for updates for', currentVersion);

  const autoUpdater = electron.autoUpdater,
    updateUrl = getUpdateUrl(currentVersion);

  if (updateUrl) {
    /* eslint max-params: ["error", 6] */
    autoUpdater.on('update-downloaded', (notes, name, date, url) => dispatch('AUTO_UPDATE_DOWNLOADED', {notes, name, date, url}));
    autoUpdater.on('error', (error) => dispatch('AUTO_UPDATE_ERROR', error.message));
    autoUpdater.on('update-available', (data) => dispatch('AUTO_UPDATE_AVAILABLE', data));
    autoUpdater.on('update-not-available', () => dispatch('AUTO_UPDATE_NOT_AVAILABLE'));
    log('info', 'check for update at', updateUrl);
    autoUpdater.setFeedURL(updateUrl);
    autoUpdater.checkForUpdates();
  }
}

/**
 * Install updates
 */
function install() {
  log('info', 'install');

  electron.autoUpdater.quitAndInstall();
}

module.exports.update = update;
module.exports.install = install;
