'use strict';

const _ = require('lodash'),
  cuid = require('cuid'),
  electron = require('electron'),
  fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  log = require('./log').asInternal(__filename),
  util = require('util'),
  availableBrowserWindowOptions = [
    'width', 'height', 'useContentSize', 'resizable', 'moveable', 'center', 'alwaysOnTop', 'show', 'frame',
    'webPreferences'
  ],
  windows = {},
  os = require('os'),
  homedir = os.homedir();

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
 * @see https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 */
function onFailLoad() {
  const args = sanitizeArguments(arguments, ['event', 'code', 'description', 'url']),
    commonErrors = exports.getCommonErrors(),
    name = _.findKey(commonErrors, {id: args.code});

  args.description = commonErrors[name] && commonErrors[name].description || args.description;

  log('error', 'onFailLoad', _.pickBy(_.assign({name}, args), _.identity));
}

function stripRedundantPathInformation(value) {
  const self = '/rodeo/',
    homeIndex = value.indexOf(homedir),
    selfIndex = value.indexOf(self);

  if (selfIndex > -1) {
    value = value.substr(selfIndex + self.length);
  } else if (homeIndex > -1) {
    value = '~' + value.substr(homeIndex + homedir.length);
  }

  return value;
}

/**
 * When a third-party is passing a billion arguments back, reporting that information can get insane fairly quickly.
 *
 * This method names each argument, and then tries to reduce any values that has redundant file strings.
 * @param {Arguments} args
 * @param {[string]} argumentNames
 * @returns {object}
 */
function sanitizeArguments(args, argumentNames) {
  return _.mapValues(_.zipObject(argumentNames, args), function (value) {
    if (_.isString(value)) {
      value = stripRedundantPathInformation(value);
    }

    return value;
  });
}

function onGetResponseDetails() {
  // ridiculous amount of arguments
  const args = sanitizeArguments(arguments, [
    'event', 'status', 'newURL', 'url', 'code', 'method', 'referrer', 'headers', 'type'
  ]);

  log('info', 'onGetResponseDetails', _.pick(args, ['code', 'url']));
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
    return 'throws ' + ex.name + ': ' + ex.message;
  }
}

function inspectBrowserWindow() {
  return 'BrowserWindow ' +
    util.inspect({
      id: getPropertySafe(this, 'id'),
      title: getPropertySafe(this, 'title'),
      url: getPropertySafe(this, 'url')
    }, {colors: false});
}

function inspectWebContents() {
  return 'WebContents ' +
    util.inspect({
      title: getPropertySafe(this, 'title'),
      url: getPropertySafe(this, 'url')
    }, {colors: false});
}

/**
 * Create window
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function create(name, options) {
  let webContents;
  const BrowserWindow = electron.BrowserWindow,
    window = new BrowserWindow(_.pick(options, availableBrowserWindowOptions)),
    token = {
      id: window.id,
      instance: window,
      name
    },
    announceReady = _.once(() => dispatchActionToOtherWindows(name, {type: 'READY_TO_SHOW', name}));

  if (!options.url) {
    throw new Error('BrowserWindows should always start with a target.  No flickering allowed.');
  }

  window.loadURL(options.url);

  // default event handlers
  window.on('close', () => log('info', 'close', name));
  window.on('closed', () => {
    log('info', 'closed', name);
    delete windows[name];
  });
  window.on('responsive', () => log('info', 'responsive', name));
  window.on('unresponsive', () => log('info', 'unresponsive', name));
  window.on('show', () => log('info', 'show', name));
  window.on('hide', () => log('info', 'hide', name));
  window.on('focus', () => log('info', 'focus', name));
  window.on('blur', () => log('info', 'blur', name));
  window.on('ready-to-show', () => {
    log('info', 'ready-to-show', name);
    announceReady();
  });
  window.on('app-command', () => log('info', 'app-command', name));
  webContents = window.webContents;
  webContents.on('did-finish-load', () => {
    log('info', 'did-finish-load', name);
    announceReady();
    runStartActions(name, options.startActions);
  });
  webContents.on('did-fail-load', onFailLoad);
  webContents.on('did-get-response-details', onGetResponseDetails);
  webContents.on('crashed', () => log('error', 'onCrashed'));
  webContents.on('plugin-crashed', () => log('error', 'onPluginCrashed'));
  webContents.on('destroyed', () => log('info', 'destroyed'));

  // how to log
  window.inspect = inspectBrowserWindow;
  window.webContents.inspect = inspectWebContents;

  // hold reference so not garbage collected
  windows[name] = token;

  return window;
}

/**
 * Dispatches a series of actions to target window
 * @param {string} name
 * @param {[{type: string}]} startActions
 */
function runStartActions(name, startActions) {
  if (_.isArray(startActions)) {
    _.each(startActions, function (action) {
      dispatchActionToWindow(name, action);
    });
  }
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
    show: false,
    acceptFirstMouse: true
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
    frame: false,
    acceptFirstMouse: true
  }, options));
}

/**
 * @param {string} name
 * @returns {BrowserWindow}
 */
function getByName(name) {
  if (windows[name]) {
    return windows[name].instance;
  }
}

/**
 * Only if the named window exists, send arguments.
 * @param {string} windowName
 * @param {string} eventName
 *
 * NOTE:  This function exists to prevent a race-condition where the window is closed or destroyed before some
 * asynchronous task completes and tries to contact a window at the end (for logging, next step, etc.)
 */
function send(windowName, eventName) {
  const target = getByName(windowName),
    eventId = cuid(),
    args = _.map(_.slice(arguments, 2), arg => _.isBuffer(arg) ? arg.toString() : arg);

  if (target && !target.isDestroyed()) {
    let webContents = target.webContents;

    webContents.send.apply(webContents, [eventName, eventId].concat(args));
  }
}

/**
 * @param {string} name
 * @param {{type: string}} action
 */
function dispatchActionToWindow(name, action) {
  log('info', 'dispatch', name, action);

  send(name, 'dispatch', action);
}

/**
 * @param {string} name
 * @param {{type: string}} action
 */
function dispatchActionToOtherWindows(name, action) {
  _.each(windows, window => {
    if (window.name !== name) {
      dispatchActionToWindow(window.name, action);
    }
  });
}

/**
 * Don't let people outside of this module access windows directly
 * @returns {Array}
 */
function getWindowNames() {
  return Object.keys(windows);
}

module.exports.create = create;
module.exports.createMainWindow = createMainWindow;
module.exports.createStartupWindow = createStartupWindow;
module.exports.getByName = getByName;
module.exports.send = send;
module.exports.getCommonErrors = _.memoize(getCommonErrors);
module.exports.getWindowNames = getWindowNames;
