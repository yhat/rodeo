'use strict';

const _ = require('lodash'),
  chalk = require('chalk'),
  electron = require('electron'),
  fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  log = require('./log').asInternal(__filename),
  util = require('util'),
  availableBrowserWindowOptions = [
    'width', 'height', 'useContentSize', 'resizable', 'moveable', 'center', 'alwaysOnTop', 'show', 'frame'
  ],
  windows = {};

/**
 * @param {Event} event
 * @this {BrowserWindow}
 */
function onClose(event) {
  log('info', 'onClose', event);

  // remove reference from list of windows
  const key = _.findKey(windows, {id: this.id});

  if (key) {
    delete windows[key];
  } else {
    log('warn', 'unable to unreference window', this);
  }

  // remove the stuff inside it
  this.webContents.send('kill');
}

function onShow(event) {
  log('info', 'onShow', event);
}

function onHide(event) {
  log('info', 'onHide', event);
}

/**
 * Emitted when the navigation is done, i.e. the spinner of the tab has stopped spinning, and
 * the onload event was dispatched.
 * @param {Event} event
 */
function onFinishLoad(event) {
  log('info', 'onFinishLoad', event);
}

function getCommonErrors() {
  const targetFile = path.resolve(path.join(__dirname, 'chromium-errors.yml'));
  let contents, commonErrors;

  try {
    contents = fs.readFileSync(targetFile, 'utf8');
    commonErrors = contents && yaml.safeLoad(contents);
  } catch (ex) {
    log('warn', 'could not read', targetFile, ex);
    commonErrors = {};
  }

  return commonErrors;
}

/**
 * @param {Event} event
 * @param {number} errorCode
 * @param {string} description
 * @param {string} validatedURL
 * @see https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 */
function onFailLoad(event, errorCode, description, validatedURL) {
  const commonErrors = exports.getCommonErrors(),
    name = _.findKey(commonErrors, {id: errorCode});

  description = commonErrors[name] && commonErrors[name].description || description;

  log('error', 'onFailLoad', event, _.pickBy({name, errorCode, description, validatedURL}, _.identity));
}

function onGetResponseDetails(event) {
  log('info', 'onGetResponseDetails', event, _.slice(arguments, 1));
}

function onCrashed(event) {
  log('error', 'onCrashed', event);
}

function onPluginCrashed(event, name, version) {
  log('error', 'onPluginCrashed', event, {name, version});
}

function onDestroyed(event) {
  log('info', 'onDestroyed', event);

  try {
    const key = _.findKey(windows, {id: this.id});

    if (!key) {
      log('warn', 'onDestroyed', 'destroyed window is still referenced');
    }
  } catch (ex) {
    log('warn', 'onDestroyed', 'failed to iterate through window references');
  }
}

/**
 * Returns a property.
 * If function, calls it to get the property value.
 * If throws, returns default value.
 *
 * @param {object} target
 * @param {string} propertyName
 * @returns {*}
 */
function getPropertySafe(target, propertyName) {
  try {
    const value = target[propertyName];

    return _.isFunction(value) && value.call(target) || value;
  } catch (ex) {
    return chalk.italics('throws ' + ex.name + ': ' + ex.message);
  }
}

function inspectBrowserWindow() {
  return 'BrowserWindow ' +
    util.inspect({
      id: getPropertySafe(this, 'id'),
      title: getPropertySafe(this, 'title'),
      url: getPropertySafe(this, 'url')
    }, {colors: true});
}

function inspectWebContents() {
  return 'WebContents ' +
    util.inspect({
      title: getPropertySafe(this, 'title'),
      url: getPropertySafe(this, 'url')
    }, {colors: true});
}

/**
 * Create window
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function create(name, options) {
  const BrowserWindow = electron.BrowserWindow,
    window = new BrowserWindow(_.pick(options, availableBrowserWindowOptions));

  if (!options.url) {
    throw new Error('BrowserWindows should always start with a target.  No flickering allowed.');
  }

  window.loadURL(options.url);

  // default event handlers
  window.on('close', onClose);
  window.on('show', onShow);
  window.on('hide', onHide);
  window.webContents.on('did-finish-load', onFinishLoad);
  window.webContents.on('did-fail-load', onFailLoad);
  window.webContents.on('did-get-response-details', onGetResponseDetails);
  window.webContents.on('crashed', onCrashed);
  window.webContents.on('plugin-crashed', onPluginCrashed);
  window.webContents.on('destroyed', onDestroyed);

  // how to log
  window.inspect = inspectBrowserWindow;
  window.webContents.inspect = inspectWebContents;

  // hold reference so not garbage collected
  windows[name] = window;

  return window;
}

/**
 * Create window with default behaviour for a main window.
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function createMainWindow(name, options) {
  const primaryDisplay = electron.screen.getPrimaryDisplay(),
    size = primaryDisplay.workAreaSize;

  return create(name, _.assign({
    width: size.width,
    height: size.height,
    show: false
  }, options));
}

/**
 * Create window with default behaviour for a startup window.
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function createStartupWindow(name, options) {
  return create(name, _.assign({
    useContentSize: true,
    resizable: false,
    moveable: true,
    center: true,
    alwaysOnTop: false,
    show: false,
    frame: false
  }, options));
}

/**
 * @param {string} name
 * @returns {BrowserWindow}
 */
function getByName(name) {
  return windows[name];
}

/**
 * Only if the named window exists, send arguments.
 * @param {string} name
 *
 * NOTE:  This function exists to prevent a race-condition where the window is closed or destroyed before some
 * asynchronous task completes and tries to contact a window at the end (for logging, next step, etc.)
 */
function send(name) {
  const target = getByName(name);

  if (target) {
    let webContents = target.webContents;

    webContents.send.apply(webContents, _.slice(arguments, 1));
  }
}

module.exports.create = create;
module.exports.createMainWindow = createMainWindow;
module.exports.createStartupWindow = createStartupWindow;
module.exports.getByName = getByName;
module.exports.send = send;
module.exports.getCommonErrors = _.memoize(getCommonErrors);
