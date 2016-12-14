import _ from 'lodash';
import bluebird from 'bluebird';
import cuid from 'cuid/dist/node-cuid';
import electron from 'electron';
import os from 'os';
import util from 'util';
import chromiumErrors from './chromium-errors.yml';

const log = require('./log').asInternal(__filename),
  availableBrowserWindowOptions = [
    'width', 'height', 'useContentSize', 'resizable', 'moveable', 'center', 'alwaysOnTop', 'show', 'frame',
    'webPreferences', 'titleBarStyle', 'parent', 'modal'
  ],
  homedir = os.homedir(),
  windows = {};

/**
 * @see https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 */
function onFailLoad() {
  const args = sanitizeArguments(arguments, ['event', 'code', 'description', 'url']),
    name = _.findKey(chromiumErrors, {id: args.code});

  args.description = chromiumErrors[name] && chromiumErrors[name].description || args.description;

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
    announceReady = _.once(() =>
      dispatchActionToOtherWindows(name, {type: 'READY_TO_SHOW', name})
        .catch(error => log('error', 'announceReady', error))
    );

  if (!options.url) {
    throw new Error('BrowserWindows should always start with a target.  No flickering allowed.');
  }

  window.loadURL(options.url);

  // default event handlers
  window.on('close', event => {
    log('info', 'close', name);
    if (name === 'mainWindow' && window.allowClose !== true) {
      event.preventDefault();
      dispatchActionToWindow('mainWindow', {type: 'ASK_QUIT'});
    }
  });
  window.on('closed', () => {
    log('info', 'closed', name);``
    delete windows[name];
  });
  window.on('responsive', () => log('info', 'responsive', name));
  window.on('unresponsive', () => log('info', 'unresponsive', name));
  window.on('ready-to-show', () => {
    log('info', 'ready-to-show', name);
    announceReady();
  });
  window.on('app-command', (e, cmd) => log('info', 'app-command', name, cmd));
  webContents = window.webContents;
  webContents.on('did-finish-load', () => {
    log('info', 'did-finish-load', name);
    announceReady();
    runStartActions(name, options.startActions);
  });
  webContents.on('did-fail-load', onFailLoad);
  webContents.on('crashed', () => log('error', 'onCrashed', arguments));
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
    titleBarStyle: 'default',
    frame: true
  }, options));
}

/**
 * Create window with default behaviour for a startup window.
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function createStartupWindow(name, options) {
  const window = create(name, _.assign({
    useContentSize: true,
    resizable: false,
    moveable: true,
    center: true,
    alwaysOnTop: false,
    show: false,
    frame: true,
    modal: true
  }, options));

  window.setMenu(null);

  return window;
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
 *
 * @returns {Promise}
 */
function send(windowName, eventName) {
  let inboundEmitter = electron.ipcMain,
    window = getByName(windowName),
    outboundEmitter = window && window.webContents,
    eventId = cuid(),
    startTime = new Date().getTime(),
    args = _.map(_.slice(arguments, 2), arg => _.isBuffer(arg) ? arg.toString() : arg);

  if (!outboundEmitter) {
    return bluebird.resolve();
  }

  return new Promise(function (resolve, reject) {
    // noinspection JSDuplicatedDeclaration
    let response,
      eventReplyName = eventName + '_reply',
      timer = setInterval(function () {
        if (outboundEmitter.isDestroyed()) {
          log('info', 'ipc ' + eventId + ': will never complete because target window is gone', eventName);
          inboundEmitter.removeListener(eventReplyName, response);
          clearInterval(timer);
          reject(new Error('Target window ' + windowName + ' is gone'));
        } else {
          log('warn', 'ipc ' + eventId + ': still waiting for', eventName);
        }
      }, 5000);

    outboundEmitter.send.apply(outboundEmitter, [eventName, eventId].concat(args));
    response = function (event, id) {
      let result, endTime;

      if (id === eventId) {
        inboundEmitter.removeListener(eventReplyName, response);
        clearInterval(timer);
        result = _.slice(arguments, 2);
        endTime = (new Date().getTime() - startTime);

        if (result[0]) {
          log('error', 'ipc ' + eventId + ': error', endTime + 'ms');
          reject(new Error(result[0].message));
        } else {
          log('info', 'ipc ' + eventId + ':', eventName, 'completed', endTime + 'ms');
          resolve(result[1]);
        }
      }
    };
    inboundEmitter.on(eventReplyName, response);
  });
}

/**
 * @param {string} windowName
 * @param {{type: string}} action
 * @returns {Promise}
 */
function dispatchActionToWindow(windowName, action) {
  log('info', 'dispatch', windowName, action);

  return send(windowName, 'dispatch', action);
}

/**
 * @param {string} name
 * @param {{type: string}} action
 * @returns {Promise}
 */
function dispatchActionToOtherWindows(name, action) {
  return bluebird.all(_.map(windows, window => {
    if (window.name !== name) {
      return dispatchActionToWindow(window.name, action);
    }
  }));
}

/**
 * Don't let people outside of this module access windows directly
 * @returns {Array}
 */
function getWindowNames() {
  return Object.keys(windows);
}

function getNameOfWindow(window) {
  const token = _.find(windows, {instance: window});

  if (token) {
    return token.name;
  }
}

function getFocusedWindow() {
  return electron.BrowserWindow.getFocusedWindow();
}

export default {
  create,
  createMainWindow,
  createStartupWindow,
  dispatchActionToWindow,
  getByName,
  send,
  getWindowNames,
  getNameOfWindow,
  getFocusedWindow
};
