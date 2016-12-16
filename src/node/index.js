import _ from 'lodash';
import args from './services/args';
import bluebird from 'bluebird';
import browserWindows from './services/browser-windows';
import cuid from 'cuid/dist/node-cuid';
import db from './services/db';
import electron from 'electron';
import environment from './services/env';
import errorClone from './services/clone';
import files from './services/files';
import installer from './services/installer';
import ipcPromises from './services/ipc-promises';
import kernelsPythonClient from './kernels/python/client';
import menuDefinitions from './services/menu-definitions';
import os from 'os';
import path from 'path';
import PlotServer from './services/plot-server';
import processes from './services/processes';
import surveyService from './services/survey';
import updater from './services/updater';
import pkg from '../../package.json';
import applicationMenu from './application-menu.yml';
import pythonLanguage from './kernels/python/language';

// enable source-maps
require('source-map-support').install();

const argv = args.getArgv(),
  log = require('./services/log').asInternal(__filename),
  staticFileDir = path.resolve(electron.app.getAppPath()),
  kernelClients = {},
  windowUrls = {
    mainWindow: 'main.html',
    startupWindow: 'startup.html',
    designWindow: 'design.html',
    freeTabsOnlyWindow: 'free-tabs-only.html'
  },
  systemFactTimeout = 120,
  autoCompleteTimeout = 5,
  second = 1000;

// cancellation is useful for managing processes
bluebird.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true
});

let plotServerInstance,
  isStartupFinished = false;

function onSurveyTabs() {
  return surveyService.getTabs();
}

function onDatabaseConnect(options) {
  return db.connect(options);
}

function onDatabaseInfo(id) {
  return db.getInfo(id);
}

function onDatabaseQuery(id, str) {
  return db.query(id, str);
}

function onDatabaseDisconnect(id) {
  return db.disconnect(id);
}

/**
 * @returns {Promise}
 */
function quitApplication() {
  const app = electron.app,
    mainWindow = browserWindows.getByName('mainWindow');

  mainWindow.allowClose = true;

  log('info', 'stopping all file watchers');
  files.stopWatching();

  log('info', 'killing all children processes');

  return bluebird.all(processes.getChildren().map(child => {
    return processes.kill(child).reflect().then(inspection => {
      if (inspection.isRejected()) {
        log('info', 'process', child.pid, 'unable to be killed', inspection.reason());
      } else {
        log('info', 'process', child.pid, 'successfully killed', inspection.value());
      }
    });
  })).finally(() => {
    log('info', 'quiting');
    app.quit();

    if (process.platform === 'linux') {
      log('info', 'forcing quit on linux');
      process.exit(0);
    }
  });
}

/**
 * Quit the application
 * @returns {Promise}
 */
function onQuitApplication() {
  log('info', 'onQuitApplication');
  return quitApplication();
}

/**
 * @param {string} dir
 * @returns {Promise}
 */
function onFiles(dir) {
  if (!_.isString(dir)) {
    throw new Error('onFiles expects a string as the first argument');
  }

  const filePath = path.resolve(files.resolveHomeDirectory(dir));

  return files.readDirectory(filePath).then(function (fileList) {
    return {
      path: filePath,
      files: fileList
    };
  });
}

function onStartWatchingFiles(requesterId, fileTarget) {
  return files.startWatching(this, requesterId, fileTarget);
}

function onStopWatchingFiles(requesterId) {
  return files.stopWatching(requesterId);
}

function onAddWatchingFiles(requesterId, fileTarget) {
  return files.addWatching(requesterId, fileTarget);
}

/**
 * On markdown?  Should change the name of this to be more clear.
 * @param {Event} event
 * @param {object} data
 * @returns {Promise}
 */
function onKnitHTML(event, data) {
  // const doc = data.doc;
  //
  // return getKernelClient('python').then(function (pythonInstance) {
  //   return md.knitHTML(doc, pythonInstance);
  // }).then(function (html) {
  //   return md.applyReportTemplate(html);
  // }).then(function (html) {
  //   event.returnValue = html; // this isn't sync anymore, so this won't work, if it ever did
  //   return html;
  // });
  return bluebird.resolve({event, data});
}

function onPDF() {
  require('dialog').showSaveDialog({
    title: 'Save Report'
  }, function (destfile) {
    if (!/\.pdf/.test(destfile)) {
      destfile += '.pdf';
    }

    browserWindows.send('mainWindow', 'pdf', destfile);
  });
}

function onFileStats(filename) {
  return files.getStats(files.resolveHomeDirectory(filename));
}

function onResolveFilePath(filename) {
  if (!_.isString(filename)) {
    throw new TypeError('Expected first parameter to be a filename');
  }

  if (filename[0] === '~') {
    return path.join(os.homedir(), filename.slice(1));
  }

  return path.resolve(filename);
}

function onGetFile(filename) {
  return files.readFile(files.resolveHomeDirectory(filename));
}

function onSaveFile(filename, contents) {
  return files.writeFile(files.resolveHomeDirectory(filename), contents);
}

/**
 * Plots are served from a temporary route, so given a route and a filename
 * we should be able to copy the temporary file to the new permanent file
 * @param {string} url
 * @param {string} filename
 * @return {Promise}
 */
function onSavePlot(url, filename) {
  // assertion
  if (!plotServerInstance.urls.has(url)) {
    throw new Error('No such url: ' + url);
  }

  const tempFilename = plotServerInstance.urls.get(url);

  return files.copy(tempFilename, filename);
}

/**
 *
 * @param {string} extension
 * @param {object} data
 * @param {string} property
 * @returns {Promise}
 */
function replacePropertyWithTemporaryFile(extension, data, property) {
  if (data[property]) {
    return files.saveToTemporaryFile(extension, data[property]).then(function (filepath) {
      let name = _.last(filepath.split(path.sep)),
        route = plotServerInstance.addRouteToFile(filepath, '/' + name);

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
 * @param {string} instanceId
 */
function subscribeBrowserWindowToEvent(windowName, emitter, eventName, instanceId) {
  emitter.on(eventName, function () {
    const list = _.map(_.toArray(arguments), arg => displayDataTransform(arg));

    return bluebird.all(list).then(function (normalizedList) {
      return browserWindows.send.apply(browserWindows, [windowName, eventName, instanceId].concat(normalizedList));
    }).catch(error => log('error', error));
  });
}

/**
 * @param {string} windowName
 * @param {JupyterClient} client
 * @param {string} instanceId
 */
function subscribeWindowToKernelEvents(windowName, client, instanceId) {
  // all jupyter events
  subscribeBrowserWindowToEvent(windowName, client, 'jupyter', instanceId);
  // terminal closed
  subscribeBrowserWindowToEvent(windowName, client, 'close', instanceId);
  // errors without association
  subscribeBrowserWindowToEvent(windowName, client, 'error', instanceId);
}

function getMainWindow() {
  const windowName = 'mainWindow';
  let window = browserWindows.getByName(windowName);

  if (!window) {
    window = browserWindows.createMainWindow(windowName, {
      url: 'file://' + path.join(staticFileDir, windowUrls[windowName])
    });
  }

  return window;
}

/**
 * @returns {Promise}
 */
function startMainWindow() {
  log('info', 'startMainWindow');
  return bluebird.try(function () {
    const window = getMainWindow();

    if (argv.dev === true) {
      window.openDevTools();
    }

    menuDefinitions.attachApplicationMenu(window.webContents, applicationMenu);
    window.show();
  });
}

function startMainWindowWithOpenFile(filename, stats) {
  return bluebird.try(function () {
    let window;
    const windowName = 'mainWindow';

    window = browserWindows.createMainWindow(windowName, {
      url: 'file://' + path.join(staticFileDir, windowUrls[windowName]),
      startActions: [
        {type: 'ADD_FILE', filename, stats}
      ]
    });

    if (argv.dev) {
      window.openDevTools();
    }

    menuDefinitions.attachApplicationMenu(window.webContents, applicationMenu);
    window.show();
  });
}

function startMainWindowWithWorkingDirectory(filename) {
  try {
    process.chdir(filename);
  } catch (ex) {
    log('error', 'failed to change working directory to', filename);

    return startStartupWindow();
  }

  return files.readDirectory(filename).then(function (files) {
    const windowName = 'mainWindow';
    let window = browserWindows.createMainWindow(windowName, {
      url: 'file://' + path.join(staticFileDir, windowUrls[windowName]),
      startActions: [
        {type: 'SET_VIEWED_PATH', path: filename, files, meta: {sender: 'self'}}
      ]
    });

    if (argv.dev) {
      window.openDevTools();
    }

    menuDefinitions.attachApplicationMenu(window.webContents, applicationMenu);
    window.show();
  });
}
/**
 * @returns {Promise}
 */
function startStartupWindow() {
  return bluebird.try(() => {
    const windowName = 'startupWindow',
      window = browserWindows.createStartupWindow(windowName, {
        url: 'file://' + path.join(staticFileDir, windowUrls[windowName])
      });

    if (argv.dev === true) {
      window.openDevTools();
    }

    window.webContents.on('did-finish-load', () => {
      window.show();
      window.once('close', () => {
        if (isStartupFinished) {
          startMainWindow()
            .catch(error => log('error', error));
        }
      });
    });
  });
}

/**
 * @returns {Promise}
 */
function onShowStartupWindow() {
  const mainWindowName = 'mainWindow',
    startupWindowName = 'startupWindow';

  return bluebird.try(() => {
    const mainWindow = browserWindows.getByName(mainWindowName),
      startupWindow = browserWindows.getByName(startupWindowName);

    if (!startupWindow) {
      isStartupFinished = false;
      const newStartupWindow = browserWindows.createStartupWindow(startupWindowName, {
        url: 'file://' + path.join(staticFileDir, windowUrls[startupWindowName]),
        parent: mainWindow
      });

      if (argv.dev === true) {
        newStartupWindow.openDevTools();
      }

      newStartupWindow.webContents.on('did-finish-load', () => {
        newStartupWindow.show();
        // the main window is already ready
        browserWindows.dispatchActionToWindow(startupWindowName, {type: 'READY_TO_SHOW', name: mainWindowName});
      });
    }
  });
}

/**
 * When Electron is ready, we can start making windows
 * @returns {Promise}
 */
function onReady() {
  return bluebird.try(() => {
    if (_.size(argv._)) {
      const statSearch = _.map(argv._, arg => {
        return files.getStats(arg)
          .catch(_.noop)
          .then(stats => ({name: path.resolve(arg), stats}));
      });

      return bluebird.all(statSearch).then(files => {
        const file = _.head(_.compact(files));

        if (file) {
          if (file.stats.isDirectory) {
            return startMainWindowWithWorkingDirectory(file.name);
          } else {
            return startMainWindowWithOpenFile(file.name, file.stats);
          }
        } else {
          log('info', 'no files found with', argv._);
          return startMainWindow();
        }
      });
    }

    return startMainWindow();
  }).then(attachIpcMainEvents)
    .catch(error => log('error', error));
}

/**
 * This runs in a short-lived python instance that is killed immediately after success or failure.
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} options.cwd
 * @returns {Promise}
 */
function onCheckKernel(options) {
  return kernelsPythonClient.check(options);
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} [options.cwd]
 * @returns {Promise}
 */
function onCreateKernelInstance(options) {
  const optionsForLog = _.omit(options, ['env']);

  return new bluebird(function (resolveInstanceId) {
    let instanceId = cuid();

    kernelClients[instanceId] = new bluebird(function (resolveClient) {
      log('info', 'creating new python kernel process', 'creating python client');
      const client = kernelsPythonClient.create(options)
        .on('ready', function () {
          log('info', 'new python kernel process is ready', instanceId, 'process', client.childProcess.pid, optionsForLog);
          resolveClient(client);
        })
        .on('event', function (source, data) {
          log('info', 'python kernel process event', instanceId, 'process', client.childProcess.pid, optionsForLog, {source, data});
        })
        .on('error', function (error) {
          log('info', 'python kernel process error', instanceId, 'process', client.childProcess.pid, optionsForLog, error);
          browserWindows.send('mainWindow', 'error', instanceId, errorClone.toObject(error)).catch(_.noop);
        })
        .on('close', function (code, signal) {
          log('info', 'python kernel process closed', instanceId, 'process', client.childProcess.pid, optionsForLog, {code, signal});
          delete kernelClients[instanceId];
        });

      log('info', 'created new python kernel process', instanceId, 'process', client.childProcess.pid, optionsForLog);

      subscribeWindowToKernelEvents('mainWindow', client, instanceId);

      return kernelClients[instanceId];
    });

    resolveInstanceId(instanceId);
  });
}

/**
 * @param {string} id
 * @returns {Promise}
 */
function onKillKernelInstance(id) {
  if (!kernelClients[id]) {
    throw new Error('Kernel with that id does not exist.');
  }

  let promise = kernelClients[id];

  log('info', 'deleted python kernel process reference', id);

  return promise
    .then(client => client.kill()).then(function () {
      log('info', 'successfully killed python kernel process reference', id);
    });
}

/**
 * @param {string} id
 * @returns {Promise}
 */
function getKernelInstanceById(id) {
  if (!kernelClients[id]) {
    throw new Error('Kernel with this id does not exist: ' + id);
  }

  return kernelClients[id];
}

/**
 * @param {object} options
 * @param {string} options.instanceId
 * @param {string} text
 * @returns {Promise}
 */
function onExecuteWithKernel(options, text) {
  if (!text) {
    throw Error('Missing text to execute');
  }

  return getKernelInstanceById(options.instanceId)
    .then(client => client.execute(text));
}

/**
 * @param {object} options
 * @param {string} options.instanceId
 * @param {object} params
 * @returns {Promise}
 */
function onInvokeWithKernel(options, params) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.invoke(params));
}

/**
 * @param {object} options
 * @param {string} options.instanceId
 * @param {object} text
 * @returns {Promise}
 */
function onInputWithKernel(options, text) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.input(text));
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} text
 * @returns {Promise}
 */
function onExecuteWithNewKernel(options, text) {
  return kernelsPythonClient.exec(options, text);
}

function onExecuteProcess(cmd, args, options) {
  return processes.exec(cmd, args, options);
}

function onGetAutoComplete(options, text, cursorPos) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.getAutoComplete(text, cursorPos))
    .timeout(autoCompleteTimeout * second, 'AutoComplete failed to finish in ' + autoCompleteTimeout + ' seconds');
}

function onIsComplete(options, text) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.isComplete(text));
}

function onGetInspection(options, text, cursorPos) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.getInspection(text, cursorPos));
}

function onGetStatus(options) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.getStatus());
}

function onExecuteHidden(options, code, resolveEvent) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.executeHidden(code, resolveEvent));
}

function onEval(options, text) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.getEval(text));
}

function onInterrupt(options) {
  return getKernelInstanceById(options.instanceId)
    .then(client => client.interrupt());
}

/**
 * Get system facts that the client-side hopefully caches and doesn't call repeatedly.
 *
 * These values should remain somewhat static on a particular machine
 * (unless something big has changed, like installing a new python or changing a home directory)
 *
 * @returns {Promise<object>}
 */
function onGetSystemFacts() {
  return bluebird.props({
    homedir: os.homedir(),
    pathSep: path.sep,
    delimiter: path.delimiter
  }).timeout(systemFactTimeout * second, 'Unable to call "get system facts" in under ' + systemFactTimeout + ' seconds');
}

function onGetEnvironmentVariables() {
  log('info', 'Getting Environment Variables');
  return environment.getEnv().tap(function (env) {
    log('info', env);
  });
}

/**
 * @returns {Promise<string>}
 */
function onGetAppLocale() {
  const app = electron.app;

  return bluebird.resolve(app.getLocale());
}

/**
 * @returns {Promise}
 */
function onQuitAndInstall() {
  return bluebird.try(updater.install);
}

function onRestartApplication() {
  return bluebird.try(function () {
    const app = electron.app;

    app.relaunch({args: process.argv.slice(1) + ['--relaunch']});
    app.exit(0);
  });
}

/**
 * We must be able to discover our current version to determine if we should update.
 * @returns {Promise}
 */
function onCheckForUpdates() {
  return updater.update(pkg.version);
}

/**
 * Open browser (not in Electron)
 * @param {string} url
 */
function onOpenExternal(url) {
  const shell = electron.shell;

  shell.openExternal(url);
}

/**
 * Open terminal (based on their OS)
 */
function onOpenTerminal() {
  const shell = electron.shell,
    isWindows = process.platform === 'win32';

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
    if (options.defaultPath) {
      options.defaultPath = files.resolveHomeDirectory(options.defaultPath);
    }

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
    if (options.defaultPath) {
      options.defaultPath = files.resolveHomeDirectory(options.defaultPath);
    }

    electron.dialog.showSaveDialog(options, resolve);
  });
}

/**
 * Toggles the dev tools
 * @returns {Promise}
 */
function onToggleDevTools() {
  const window = browserWindows.getFocusedWindow() || this;

  return bluebird.try(function () {
    window.toggleDevTools();
  });
}

/**
 * Toggles full screen mode
 * @returns {Promise}
 */
function onToggleFullScreen() {
  const window = browserWindows.getFocusedWindow() || this;

  return bluebird.try(function () {
    window.setFullScreen(!window.isFullScreen());
  });
}

/**
 * @param {string} name
 * @param {object} options
 * @returns {BrowserWindow}
 */
function onCreateWindow(name, options) {
  // prefix url with our location
  if (!options.url) {
    throw new Error('Missing url for createWindow');
  }

  if (!windowUrls[options.url]) {
    throw new Error('Cannot find window entry point for ' + options.url);
  }

  options.url = 'file://' + path.join(staticFileDir, windowUrls[options.url]);

  const window = browserWindows.create(name, options);

  if (argv.dev === true) {
    window.openDevTools();
  }

  return window;
}

function onFinishStartup() {
  const startupWindow = browserWindows.getByName('startupWindow');

  if (startupWindow) {
    isStartupFinished = true;
    startupWindow.close();
  }
}

/**
 * Share an action with every window except the window that send the action.
 * @param {object} action
 * @returns {Promise}
 */
function onShareAction(action) {
  const names = browserWindows.getWindowNames();

  if (names.length === 1) {
    return bluebird.resolve();
  }

  let senderInstance = this,
    sender = _.find(names, function (name) {
      const window = browserWindows.getByName(name);

      return window && window.webContents === senderInstance;
    });

  action.meta = {sender};

  return bluebird.all(_.map(names, function (name) {
    if (name !== sender) {
      return browserWindows.send(name, 'sharedAction', action)
        .catch(_.noop); // we don't care about failure
    }
  }));
}

/**
 * Attaches events to the main process
 */
function attachIpcMainEvents() {
  const ipcMain = electron.ipcMain;

  log('info', 'attachIpcMainEvents');

  ipcPromises.exposeElectronIpcEvents(ipcMain, [
    onAddWatchingFiles,
    onCheckForUpdates,
    onCheckKernel,
    onCloseWindow,
    onCreateKernelInstance,
    onCreateWindow,
    onDatabaseConnect,
    onDatabaseInfo,
    onDatabaseQuery,
    onDatabaseDisconnect,
    onEval,
    onExecuteWithKernel,
    onExecuteWithNewKernel,
    onExecuteProcess,
    onExecuteHidden,
    onFiles,
    onFileStats,
    onFinishStartup,
    onGetAppLocale,
    onGetAutoComplete,
    onGetEnvironmentVariables,
    onGetFile,
    onGetInspection,
    onGetSystemFacts,
    onGetStatus,
    onIsComplete,
    onInputWithKernel,
    onInterrupt,
    onInvokeWithKernel,
    onKnitHTML,
    onQuitApplication,
    onPDF,
    onResolveFilePath,
    onRestartApplication,
    onSaveFile,
    onSavePlot,
    onShareAction,
    onShowStartupWindow,
    onStartWatchingFiles,
    onStopWatchingFiles,
    onSurveyTabs,
    onQuitAndInstall,
    onOpenExternal,
    onOpenTerminal,
    onOpenDialog,
    onSaveDialog,
    onToggleDevTools,
    onToggleFullScreen,
    onKillKernelInstance
  ]);
}

function startApp() {
  const app = electron.app,
    appUserModelId = 'com.squirrel.rodeo.Rodeo';

  if (app) {
    app.setAppUserModelId(appUserModelId);
    const isActiveSquirrelCommand = installer.handleSquirrelStartupEvent();

    // record for later use
    log('info', {
      action: 'started',
      argv, 'process.argv': process.argv,
      cwd: process.cwd(),
      versions: process.versions,
      resourcesPath: process.resourcesPath,
      isActiveSquirrelCommand
    });

    if (isActiveSquirrelCommand) {
      log('info', 'was squirrely');
      require('./services/log').afterFileTransportFlush(() => process.exit(0));
    } else {
      pythonLanguage.extendOwnEnv();
      attachAppEvents(app);
      return startPlotServer();
    }
  }
}

/**
 * Attach events only if we're not in a browser window
 * @param {electron.app} app
 */
function attachAppEvents(app) {
  app.on('will-finish-launching', function () {
    log('info', 'will-finish-launching');
  });
  app.on('will-quit', function () {
    log('info', 'will-quit');
  });
  app.on('before-quit', function () {
    log('info', 'before-quit');
  });
  app.on('quit', function (event, errorCode) {
    log('info', 'quit', {errorCode});
  });
  app.on('activate', function (event, hasVisibleWindows) {
    log('info', 'activate', {hasVisibleWindows});
  });
  app.on('gpu-process-crashed', function () {
    log('info', 'gpu-process-crashed');
  });
  app.on('window-all-closed', () => {
    log('info', 'onWindowAllClosed');
    return quitApplication();
  });
  app.on('ready', onReady);
}

function startPlotServer() {
  plotServerInstance = new PlotServer(Math.floor(Math.random() * 2000) + 8000);

  return plotServerInstance.listen()
    .then(port => log('info', 'serving plots from port', port))
    .catch(error => log('critical', 'failure to start plot server', error));
}

startApp();
