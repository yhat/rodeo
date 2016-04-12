'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  electron = require('electron'),
  browserWindows = require('./browser-windows'),
  log = require('./log').asInternal(__filename),
  rest = require('./rest'),
  os = require('os');

/**
 * @returns {string}
 */
function getUpdateUrl() {
  switch (process.env.NODE_ENV) {
    case 'dev': return 'http://localhost:3000';
    default: return 'https://rodeo-updates.yhat.com';
  }
}

/**
 * @param {string} windowName
 * @param {string} updateUrl
 * @param {Error} error
 */
function onError(windowName, updateUrl, error) {
  log('warn', 'onError', updateUrl, error);

  browserWindows.send(windowName, 'log', '[ERROR]: ' + error);
}

/**
 *
 * @param {string} windowName
 * @param {object} data
 */
function onUpdateAvailable(windowName, data) {
  log('info', 'onUpdateAvailable', data);

  browserWindows.send(windowName, 'log', 'UPDATE AVAILABLE');
  browserWindows.send(windowName, 'log', JSON.stringify(data));
}

/**
 * @param {string} windowName
 * @param {boolean} displayNoUpdate
 */
function onUpdateNotAvailable(windowName, displayNoUpdate) {
  log('info', 'onUpdateNotAvailable');
  if (displayNoUpdate == true) { // todo: remove this, we shouldn't decide this here
    browserWindows.send(windowName, 'no-update');
  }
}

/* eslint max-params: ["error", 6] */
function onUpdateDownloaded(windowName, evt, releaseNotes, releaseName, releaseDate, updateURL) {
  log('info', 'onUpdateDownloaded', {evt, releaseNotes, releaseName, releaseDate, updateURL});
  browserWindows.send(windowName, 'log', releaseNotes + '---' + releaseName + '---' + releaseDate + '---' + updateURL);
  browserWindows.send(windowName, 'update-ready', { platform: 'osx' });  // ???
}

/**
 * @param {boolean} displayNoUpdate
 * @returns {Promise}
 */
function update(displayNoUpdate) {
  const windowName = 'mainWindow',
    app = electron.app,
    autoUpdater = electron.autoUpdater,
    platform = os.platform() + '_' + os.arch(),
    version = app.getVersion(),
    updateUrl = getUpdateUrl() + '?platform=' + platform + '&version=' + version;

  autoUpdater.on('error', _.partial(onError, windowName, updateUrl));
  autoUpdater.on('update-available', _.partial(onUpdateAvailable, windowName));
  autoUpdater.on('update-not-available', _.partial(onUpdateNotAvailable, windowName, displayNoUpdate));
  autoUpdater.on('update-downloaded', _.partial(onUpdateDownloaded, windowName));

  return bluebird.delay(2000)
    .then(function () {
      if (/win32/.test(platform)) {
        return rest.get(updateUrl).then(function (res) {
          if (res.statusCode != 204) {
            browserWindows.send(windowName, 'update-ready', { platform: 'windows' });
          }
        }).catch('error', function (err) {
          if (err) {
            log('error', 'checkForUpdates::https.get:error', updateUrl, err);
            return;
          }

          log('error', 'could not check for windows update', updateUrl);
        });
      } else {
        autoUpdater.setFeedURL(updateUrl);
        autoUpdater.checkForUpdates();
      }
    });
}

/**
 * Install updates
 */
function install() {
  log('info', 'quitAndInstall');

  const autoUpdater = electron.autoUpdater;

  autoUpdater.quitAndInstall();
}

module.exports.update = update;
module.exports.install = install;