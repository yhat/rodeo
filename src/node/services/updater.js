'use strict';

const electron = require('electron'),
  browserWindows = require('./browser-windows'),
  log = require('./log').asInternal(__filename),
  path = require('path'),
  pkg = require(path.join(__dirname, '../../package.json'));

/**
 * @param {string} type
 * @param {*} data
 */
function dispatch(type, data) {
  log('info', 'dispatch', type, arguments);
  browserWindows.send('mainWindow', 'dispatch', {type, data});
}

/**
 * @returns {string}
 */
function getUpdateUrl() {
  let hostname;
  if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('dev') > -1) {
    hostname = process.env.RODEO_UPDATES || 'http://localhost:3333';
  } else {
    hostname = 'https://rodeo-updates.yhat.com';
  }

  if (process.platform === 'darwin') {
    return hostname + `/update/osx/${pkg.version}}`;
  } else if (process.platform === 'win32') {
    return hostname + `/update/osx/${pkg.version}}`;
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
