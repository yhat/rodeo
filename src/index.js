/* globals USER_WD:true */
'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  electron = require('electron'),
  browserWindows = require('./services/browser-windows'),
  files = require('./services/files'),
  fs = require('fs'),
  path = require('path'),
  md = require('./services/md'),
  os = require('os'),
  preferences = require('./services/preferences'),
  steveIrwin = require('./kernels/python/steve-irwin'),
  updater = require('./services/updater'),
  log = require('./services/log').asInternal(__filename),
  staticFileDir = path.resolve('./static/'),
  allowedKernelLangauges = ['python'],
  kernelClients = {},
  USER_HOME = os.homedir();

electron.crashReporter.start({
  productName: 'Yhat Dev',
  companyName: 'Yhat',
  submitURL: 'https://rodeo-updates.yhat.com/crash',
  autoSubmit: true
});

/**
 * Quit the application
 */
function onQuitApplication() {
  const app = electron.app;

  app.quit();
}

/**
 * @param {string} dir
 * @returns {Promise}
 */
function onFiles(dir) {
  return files.readDirectory(path.resolve(dir));
}

/**
 * On markdown?  Should change the name of this to be more clear.
 * @param {Event} event
 * @param {object} data
 * @returns {Promise}
 */
function onKnitHTML(event, data) {
  const doc = data.doc;

  return getKernelClient('python').then(function (pythonInstance) {
    return md.knitHTML(doc, pythonInstance);
  }).then(function (html) {
    return md.applyReportTemplate(html);
  }).then(function (html) {
    event.returnValue = html; // this isn't sync anymore, so this won't work, if it ever did
    return html;
  });
}

function onPDF() {
  require('dialog').showSaveDialog({
    title: 'Save Report',
    default_path: USER_WD
  }, function (destfile) {
    if (! /\.pdf/.test(destfile)) {
      destfile += '.pdf';
    }

    browserWindows.send('mainWindow', 'pdf', destfile);
  });
}

function onGetFile(event, filepath) {
  let content = '';

  if (/^~/.test(filepath)) {
    filepath = filepath.replace('~', USER_HOME);
  }

  if (fs.existsSync(filepath)) {
    content = fs.readFileSync(filepath).toString();
  }
  event.returnValue = {
    basename: path.basename(filepath),
    pathname: filepath,
    content: content
  };
}

function onSaveFile(event, data) {
  fs.writeFile(data.filepath, data.content, function (err) {
    if (err) {
      log('error', 'onSaveFile', err);
      return;
    }

    event.returnValue = {
      status: 'OK',
      filepath: data.filepath,
      basename: path.basename(data.filepath)
    };
  });
}

/**
 * This should probably be with the startup window.
 */
function onExitTour() {
  const targetWindow = browserWindows.getByName('startupWindow');

  if (targetWindow) {
    targetWindow.close();
  }
}

/**
 * @param {Event} event
 * @this {BrowserWindow}
 */
function onCloseWindow(event) {
  log('debug', 'onCloseWindow', this, event);

  this.webContents.send('kill');
}

/**
 * @param {string} windowName
 * @param {JupyterClient} client
 */
function subscribeWindowToKernelEvents(windowName, client) {
  subscribeBrowserWindowToEvent(windowName, client, 'shell');
  subscribeBrowserWindowToEvent(windowName, client, 'iopub');
  subscribeBrowserWindowToEvent(windowName, client, 'stdin');
}

// Quit when all windows are closed.
function onWindowAllClosed() {
  const app = electron.app;

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }

  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
function onReady() {
  let mainWindow, startupWindow;

  mainWindow = browserWindows.createMainWindow('mainWindow', {
    url: 'file://' + path.join(staticFileDir, 'desktop-index.html')
  });
  startupWindow = browserWindows.createStartupWindow('startupWindow', {
    url: 'file://' + path.join(staticFileDir, 'startup.html')
  });

  startupWindow.webContents.on('did-finish-load', function () {

    // show when we're done loading,
    startupWindow.show();
    startupWindow.openDevTools();
    // startupWindow.once('close', function () {
    //   mainWindow.show();
    // });
    mainWindow.show();
  });

  // Open the devtools.
  // mainWindow.openDevTools();

  attachIpcMainEvents();

  updater.update(false)
    .catch(function (err) {
      log('warn', 'failed to initialize auto-update', err);
    });
}

/**
 * @param {Event} event
 * @param {string} filePath
 */
function openFile(event, filePath) {
  browserWindows.send('mainWindow', 'open-file', filePath);
}

/**
 * Only one item per key will exist or can be requested.  If the item is being created, others will wait as well.
 * @param {object} list  list of items that can only exist once
 * @param {string} key  identifier
 * @param {function} fn  creation function
 * @returns {Promise}
 */
function promiseOnlyOne(list, key, fn) {
  let promise = list[key];

  if (promise) {
    return promise;
  } else {
    promise = bluebird.try(fn);
    list[key] = promise;
    return promise;
  }
}

/**
 * Currently, named on language name.  We could make this more specific (python2.7) later.
 * @param {string} language
 * @returns {Promise}
 */
function getKernelClient(language) {
  language = language || 'python';
  return promiseOnlyOne(kernelClients, language, function () {
    let clientFactory = require('./kernels/python/client');

    return clientFactory.create().then(function (client) {
      subscribeWindowToKernelEvents('mainWindow', client);
    });
  });
}

/**
 * @param {string} text
 * @param {object} [kernelOptions]
 * @param {string} [kernelOptions.language]
 * @returns {Promise}
 */
function onExecuteWithKernel(text, kernelOptions) {
  kernelOptions = kernelOptions || {};
  let language = kernelOptions.language || 'python';

  if (!_.includes(allowedKernelLangauges, language)) {
    throw new Error('options did not include valid kernel language: ' + language);
  }

  return getKernelClient(language).then(function (clientInstance) {
    return clientInstance.execute(text);
  });
}

/**
 * Forward these events along to a BrowserWindow (but only if the window exists)
 * @param {string} windowName
 * @param {EventEmitter} emitter
 * @param {string} eventName
 */
function subscribeBrowserWindowToEvent(windowName, emitter, eventName) {
  emitter.on(eventName, function () {
    browserWindows.send.apply(browserWindows, [windowName, eventName].concat(_.slice(arguments)));
  });
}

/**
 * @param {string} name
 * @param {string} requestId
 * @param {Event} event
 * @returns {function}
 */
function replyToEvent(name, requestId, event) {
  const replyName = name + '_reply';

  return function (data) {
    try {
      if (_.isError(data)) {
        log('error', 'event failed', name, data);
        event.sender.send(replyName, requestId, {name: data.name, message: data.message});
      } else {
        event.sender.send(replyName, requestId, null, data);
      }
    } catch (ex) {
      log('error', 'failed to reply to event', name, data, ex);
    }
  };
}

/**
 * Standardize our naming by forcing a convention.
 *
 * Take a list of functions and bind them to events of the exact same name in snake_case.
 *
 * The other side should be listening for a reply with the same requestId that follows
 * the node convention of (err, data)
 *
 * This is important because there are a lot of ways for functions to fail with these events, so having a standard
 * way to catch these errors is useful for maintainability
 *
 * @param {EventEmitter} ipcEmitter
 * @param {[function]} list
 */
function exposeElectronIpcEvents(ipcEmitter, list) {
  _.each(list, function (fn) {
    const name = _.snakeCase(fn.name.replace(/^on/, ''));

    log('info', 'exposeElectronIpcEvents exposing', name);

    ipcEmitter.on(name, function (event, id) {
      try {
        log('info', 'responding to ipc event', name, _.slice(arguments, 2));

        bluebird.method(fn).apply(null, _.slice(arguments, 1))
          .then(replyToEvent(name, id, event))
          .catch(replyToEvent(name, id, event));
      } catch (ex) {
        log('error', 'failed to wait for reply to event', name, event, ex);
      }
    });
  });
}

/**
 * Get system facts that the client-side hopefully caches and doesn't call repeatedly
 * @returns {Promise<object>}
 */
function onGetSystemFacts() {
  log('info', 'getting system facts');

  return bluebird.props({
    availablePythonKernels: steveIrwin.findPythons(steveIrwin.getFacts()),
    preferences: preferences.getPreferences(),
    pythonStarts: getKernelClient().then(function () { return true; }),
    python: require('./kernels/python/client').checkPython(),
    homedir: os.homedir()
  });
}

function onUpdateAndInstall() {
  return updater.install();
}

function onCheckForUpdates() {
  return updater.update(true);
}

/**
 * Attaches events to the main process
 */
function attachIpcMainEvents() {
  const ipcMain = electron.ipcMain;

  // todo: use this more
  exposeElectronIpcEvents(ipcMain, [
    onExecuteWithKernel,
    onFiles,
    onGetSystemFacts,
    onKnitHTML,
    onQuitApplication,
    onPDF,
    onGetFile,
    onSaveFile,
    onUpdateAndInstall,
    onCheckForUpdates,
    onExitTour
  ]);
}

/**
 * Attach events only if we're not in a browser window
 */
function attachAppEvents() {
  const app = electron.app;

  if (app) {
    app.on('open-file', openFile);
    app.on('window-all-closed', onWindowAllClosed);
    app.on('ready', onReady);
  }
}

module.exports.onPDF = onPDF;
module.exports.onQuitApplication = onQuitApplication;
module.exports.openFile = openFile;
module.exports.onReady = onReady;
module.exports.onCloseWindow = onCloseWindow;
module.exports.onWindowAllClosed = onWindowAllClosed;

attachAppEvents();
