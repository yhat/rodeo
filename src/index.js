/* globals USER_WD:true */
'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  electron = require('electron'),
  browserWindows = require('./services/browser-windows'),
  files = require('./services/files'),
  ipcPromises = require('./services/ipc-promises'),
  path = require('path'),
  md = require('./services/md'),
  menuDefinitions = require('./services/menu-definitions'),
  os = require('os'),
  preferences = require('./services/preferences'),
  promises = require('./services/promises'),
  steveIrwin = require('./kernels/python/steve-irwin'),
  updater = require('./services/updater'),
  yargs = require('yargs'),
  argv = yargs.argv,
  log = require('./services/log').asInternal(__filename),
  staticFileDir = path.resolve('./static/'),
  allowedKernelLangauges = ['python'],
  kernelClients = {};

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
  if (!_.isString(dir)) {
    throw new Error('onFiles expects a string as the first argument');
  }

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

function onFileStats(filename) {
  return files.getStats(filename);
}

function onGetFile(filename) {
  return files.readFile(filename);
}

function onSaveFile(filename, contents) {
  return files.writeFile(filename, contents);
}

function replacePropertyWithTemporaryFile(extension, data, property) {
  if (data[property]) {
    return files.saveToTemporaryFile(extension, data[property]).then(function (filepath) {
      let name = _.last(filepath.split('/')),
        route = require('./services/server').addTemporaryFileRoute(filepath, '/' + name);

      log('info', 'new plot served from', route);

      data[property] = route;
    });
  } else {
    log('debug', 'no', property, 'on data');
  }
}

/**
 * Transform display data events to refer to a temporary file instead of passing raw data
 * @param {object} event
 * @returns {Promise}
 */
function displayDataTransform(event) {
  const type = _.get(event, 'result.msg_type'),
    data = _.get(event, 'result.content.data');

  if (type === 'display_data' && data) {
    if (data['image/png']) {
      data['image/png'] = new Buffer(data['image/png'], 'base64');
    }

    return bluebird.all([
      replacePropertyWithTemporaryFile('.html', data, 'text/html'),
      replacePropertyWithTemporaryFile('.png', data, 'image/png'),
      replacePropertyWithTemporaryFile('.svg', data, 'image/svg')
    ]).then(function () {
      return event;
    });
  }

  return bluebird.resolve(event);
}

/**
 * Forward these events along to a BrowserWindow (but only if the window exists)
 * @param {string} windowName
 * @param {EventEmitter} emitter
 * @param {string} eventName
 */
function subscribeBrowserWindowToEvent(windowName, emitter, eventName) {
  emitter.on(eventName, function (event) {
    displayDataTransform(event).then(function (normalizedEvent) {
      browserWindows.send.apply(browserWindows, [windowName, eventName].concat([normalizedEvent]));
    }).catch(function (error) {
      log('error', error);
    });
  });
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

function startMainWindow() {
  const mainWindow = browserWindows.getByName('mainWindow');

  if (argv.dev === true) {
    mainWindow.openDevTools();
  }

  return attachApplicationMenu(mainWindow.webContents).then(function () {
    mainWindow.show();
    mainWindow.focus();
  }).catch(function (error) {
    log('error', error);
  });
}

function startStartupWindow() {
  return new bluebird(function (resolve) {
    const startupWindow = browserWindows.createStartupWindow('startupWindow', {
      url: 'file://' + path.join(staticFileDir, 'startup.html')
    });

    startupWindow.webContents.on('did-finish-load', function () {
      startupWindow.show();
      startupWindow.focus();
      startupWindow.once('close', function () {
        startMainWindow().catch(function (error) {
          log('error', error);
        });
      });
    });

    resolve();
  });
}

function attemptAutoupdate() {
  return updater.update(false)
    .catch(err => log('warn', 'failed to initialize auto-update', err));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
function onReady() {
  if (argv.design) {
    let designWindow = browserWindows.create('designWindow', {
      url: 'file://' + path.join(staticFileDir, 'design.html')
    });

    designWindow.show();
  } else {
    // start loading main window in background
    browserWindows.createMainWindow('mainWindow', {
      url: 'file://' + path.join(staticFileDir, 'desktop-index.html')
    });

    (argv.startup === false ? startMainWindow() : startStartupWindow())
      .then(attachIpcMainEvents)
      .then(attemptAutoupdate)
      .catch(err => log('error', err));
  }
}

/**
 * @param {Event} event
 * @param {string} filePath
 */
function openFile(event, filePath) {
  browserWindows.send('mainWindow', 'open-file', filePath);
}

/**
 * Currently, named on language name.  We could make this more specific (python2.7) later.
 * @param {string} language
 * @returns {Promise}
 */
function getKernelClient(language) {
  language = language || 'python';
  return promises.promiseOnlyOne(kernelClients, language, function () {
    let clientFactory = require('./kernels/python/client');

    return clientFactory.create().then(function (client) {
      subscribeWindowToKernelEvents('mainWindow', client);
      return client;
    });
  });
}

/**
 * @param {string} text
 * @param {object} [kernelOptions]
 * @param {string} [kernelOptions.language]
 * @returns {Promise}
 */
function onExecute(text, kernelOptions) {
  kernelOptions = kernelOptions || {};
  let language = kernelOptions.language || 'python';

  if (!_.includes(allowedKernelLangauges, language)) {
    throw new Error('options did not include valid kernel language: ' + language);
  }

  return getKernelClient(language).then(function (clientInstance) {
    return clientInstance.execute(text);
  });
}

function findPythons() {
  if (argv.pythons === false) {
    return [];
  } else {
    return steveIrwin.findPythons(steveIrwin.getFacts());
  }
}

/**
 * Get system facts that the client-side hopefully caches and doesn't call repeatedly
 * @returns {Promise<object>}
 */
function onGetSystemFacts() {
  return bluebird.props({
    availablePythonKernels: findPythons(),
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
 * Open browser (not in Electron)
 * @param {string} url
 */
function onOpenExternal(url) {
  const shell = electron.shell;

  log('debug', 'opening in default browser', url);

  shell.openExternal(url);
}

/**
 * Open terminal (based on their OS)
 */
function onOpenTerminal() {
  const shell = electron.shell,
    isWindows = process.platform === 'win32';

  log('debug', 'opening terminal');

  // todo: obviously, this may go badly on linux
  shell.openItem(isWindows ? 'cmd.exe' : '/Applications/Utilities/Terminal.app');
}

/**
 * @param {string} windowName
 * @returns {Promise}
 */
function onCloseWindow(windowName) {

  if (windowName) {
    const window = browserWindows.getByName(windowName);

    if (window) {
      window.close();
      return bluebird.resolve();
    } else {
      log('warn', 'tried to close non-existent window', windowName);
      return bluebird.reject(new Error('tried to close non-existent window ' + windowName));
    }
  } else {
    log('warn', 'tried to close window without saying name');
    return bluebird.reject(new Error('tried to close window without saying name'));
  }
}

/**
 * @param {object} [options]
 * @param {string} [options.title]
 * @param {string} [options.defaultPath]
 * @param {object} [options.properties]
 * @param {Array} [options.filters]
 * @returns {Promise}
 * @example onOpenDialog({ title: 'Select your Python', properties: ['openFile'] })
 */
function onOpenDialog(options) {
  options = _.pick(options || {}, ['title', 'defaultPath', 'properties', 'filters']);

  return new bluebird(function (resolve) {
    electron.dialog.showOpenDialog(options, resolve);
  });
}

/**
 * @param {object} [options]
 * @param {string} [options.title]
 * @param {string} [options.defaultPath]
 * @param {Array} [options.filters]
 * @returns {Promise}
 * @example onSaveDialog({ title: 'Save your Python' })
 */
function onSaveDialog(options) {
  options = _.pick(options || {}, ['title', 'defaultPath', 'filters']);

  return new bluebird(function (resolve) {
    electron.dialog.showSaveDialog(options, resolve);
  });
}

/**
 * Attaches events to the main process
 */
function attachIpcMainEvents() {
  const ipcMain = electron.ipcMain;

  ipcPromises.exposeElectronIpcEvents(ipcMain, [
    onExecute,
    onFiles,
    onGetSystemFacts,
    onKnitHTML,
    onQuitApplication,
    onPDF,
    onGetFile,
    onSaveFile,
    onFileStats,
    onUpdateAndInstall,
    onCheckForUpdates,
    onCloseWindow,
    onOpenExternal,
    onOpenTerminal,
    onOpenDialog,
    onSaveDialog
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

    require('./services/server').start(3000);
  }
}

/**
 *
 * @param {EventEmitter} ipcEmitter
 * @returns {Promise}
 */
function attachApplicationMenu(ipcEmitter) {
  const Menu = electron.Menu;

  return menuDefinitions.getByName('application').then(function (definition) {
    return menuDefinitions.toElectronMenuTemplate(ipcEmitter, definition);
  }).then(function (menuTemplate) {
    const menu = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(menu);
  });
}

module.exports.onCloseWindow = onCloseWindow;
module.exports.onFiles = onFiles;
module.exports.onPDF = onPDF;
module.exports.onQuitApplication = onQuitApplication;
module.exports.openFile = openFile;
module.exports.onReady = onReady;
module.exports.onWindowAllClosed = onWindowAllClosed;

attachAppEvents();
