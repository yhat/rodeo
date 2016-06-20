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
  windows = {},
  os = require('os'),
  homedir = os.homedir();

/**
 * @this {BrowserWindow}
 */
function onClose() {
  log('info', 'onClose');

  // remove reference from list of windows
  const key = _.findKey(windows, {id: this.id});

  if (key) {
    delete windows[key];
  } else {
    log('warn', 'unable to unreference window');
  }

  // remove the stuff inside it
  this.webContents.send('kill');
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
  window.on('show', () => log('info', 'show'));
  window.on('hide', () => log('info', 'hide'));
  window.webContents.on('did-finish-load', () => log('info', 'onFinishLoad'));
  window.webContents.on('did-fail-load', onFailLoad);
  window.webContents.on('did-get-response-details', onGetResponseDetails);
  window.webContents.on('crashed', () => log('error', 'onCrashed'));
  window.webContents.on('plugin-crashed', () => log('error', 'onPluginCrashed'));
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
