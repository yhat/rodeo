'use strict';

const electron = require('electron'),
  browserWindows = require('./browser-windows'),
  log = require('./log').asInternal(__filename);

/**
 * @param {string} eventName
 * @param {*} data
 */
function dispatch(eventName, data) {
  log('info', 'dispatch', eventName, arguments);
  browserWindows.send('mainWindow', 'dispatch', eventName, data);
}

/**
 * @returns {string}
 */
function getUpdateUrl() {
  const pkg = require('../../../package.json');

  if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('dev') > -1) {
    return 'http://localhost:3333';
  }

  if (process.platform === 'darwin') {
    return `https://rodeo-updates.yhat.com/update/osx/${pkg.version}}`;
  } else if (process.platform === 'win32') {
    return `https://rodeo-updates.yhat.com/update/win32/${pkg.version}}`;
  }
}

/**
 */
function update() {
  const autoUpdater = electron.autoUpdater,
    updateUrl = getUpdateUrl();

  if (updateUrl) {
    /* eslint max-params: ["error", 6] */
    autoUpdater.on('update-downloaded', (notes, name, date, url) => dispatch('AUTO_UPDATE_DOWNLOADED', {notes, name, date, url}));
    autoUpdater.on('error', (error) => dispatch('AUTO_UPDATE_ERROR', error.message));
    autoUpdater.on('update-available', (data) => dispatch('AUTO_UPDATE_AVAILABLE', data));
    autoUpdater.on('update-not-available', () => dispatch('AUTO_UPDATE_NOT_AVAILABLE'));
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
