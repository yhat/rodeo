const _ = require('lodash'),
  bluebird = require('bluebird'),
  electron = require('electron'),
  log = require('./log').asInternal(__filename),
  availableBrowserWindowOptions = ['width', 'height', 'useContentSize', 'resizable', 'moveable', 'center', 'alwaysOnTop'],
  windows = {};

/**
 * @param {Event} event
 * @this {BrowserWindow}
 */
function onClose(event) {
  log('error', 'onClose', this, event);

  // remove reference from list of windows
  _.pullAllWith(windows, this);

  // remove the stuff inside it
  this.webContents.send('kill');
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

  return create(name, _.assign({width: size.width, height: size.height}, options));
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
    moveable: false,
    center: true,
    alwaysOnTop: true
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