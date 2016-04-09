/* globals USER_WD:true */
'use strict';

const _ = require('lodash'),
  electron = require('electron'),
  browserWindows = require('rodeo/browser-windows'),
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  https = require('https'),
  kernel = require('kernels/python/index'),
  md = require('rodeo/md'),
  findFile = require('rodeo/find-file'),
  preferences = require('rodeo/preferences'),
  log = require('rodeo/log').asInternal(__filename);

electron.crashReporter.start({
  productName: 'Yhat Dev',
  companyName: 'Yhat',
  submitURL: 'https://rodeo-updates.yhat.com/crash',
  autoSubmit: true
});

/**
 * @returns {string}
 */
function getUpdateUrl() {
  switch (process.env.NODE_ENV) {
    case 'dev': return 'http://localhost:3000';
    default: return 'https://rodeo-updates.yhat.com';
  }
}

function checkForUpdates(displayNoUpdate) {
  const windowName = 'mainWindow',
    app = electron.app,
    autoUpdater = electron.autoUpdater,
    platform = os.platform() + '_' + os.arch(),
    version = app.getVersion(),
    updateUrl = getUpdateUrl() + '?platform=' + platform + '&version=' + version;

  autoUpdater.on('error', function (err, msg) {
    if (err) {
      log('error', 'checkForUpdates::autoUpdater:error', err);
      return;
    }

    browserWindows.send(windowName, 'log', '[ERROR]: ' + msg);
  });

  autoUpdater.on('update-available', function (data) {
    browserWindows.send(windowName, 'log', 'UPDATE AVAILABLE');
    browserWindows.send(windowName, 'log', JSON.stringify(data));
  });

  autoUpdater.on('update-not-available', function () {
    if (displayNoUpdate == true) {
      browserWindows.send(windowName, 'no-update');
    }
  });

  /* eslint max-params: ["error", 5] */
  autoUpdater.on('update-downloaded', function (evt, releaseNotes, releaseName, releaseDate, updateURL) {
    browserWindows.send(windowName, 'log', releaseNotes + '---' + releaseName + '---' + releaseDate + '---' + updateURL);
    browserWindows.send(windowName, 'update-ready', { platform: 'osx' });
  });

  setTimeout(function () {
    if (/win32/.test(platform)) {
      https.get(updateUrl, function (res) {
        if (res.statusCode != 204) {
          browserWindows.send(windowName, 'update-ready', { platform: 'windows' });
        }
      }).on('error', function (err) {
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
  }, 2000);
}

/**
 * @param {Event} event
 */
function onQuitApplication(event) {
  const app = electron.app;

  log('debug', 'onQuitApplication', this, event);

  app.quit();
}

function onGetPreferences(event) {
  log('debug', 'onGetPreferences', this, event);

  event.returnValue = preferences.getPreferences();
}

/**
 * @param {Event} event
 * @param {{name: string, value: *}} data
 */
function onSetPreferences(event, data) {
  log('debug', 'onSetPreferences', this, event, data);

  preferences.setPreferences(data.name, data.value);
  event.returnValue = null;
}

/**
 * @param {Event} event
 * @param {{stream: boolean, command: string, autocomplete: boolean}} data
 */
function onCommand(event, data) {
  const python = global.python,
    windowName = 'mainWindow';

  log('debug', 'onCommand', this, event, data);

  if (python && python.executeStream) {
    if (data.stream == true || data.stream == 'true') {
      python.executeStream(data.command, data.autocomplete == 'true', function (result) {
        result.command = data.command;
        if (result.image || result.html) {
          browserWindows.send(windowName, 'plot', result);
          browserWindows.send(windowName, 'refresh-variables');
        }
        event.sender.send('command', result);
      });
    } else {
      python.execute(data.command, data.autocomplete == 'true' || data.autocomplete == true, function (result) {
        result.command = data.command;
        result.status = 'complete';
        event.returnValue = result;
      });
    }
  } else {
    if (data.stream == true) {
      // not sure if we even need to do this one...
      // event.sender.send('command', {});
    } else {
      event.returnValue = null;
    }
  }
}

function onIndexFiles(event) {
  event.sender.sendJSON = function (data) {
    const mainWindow = browserWindows.getByName('mainWindow');

    if (mainWindow && event.sender && event.sender.send) {
      event.sender.send(data.msg, data);
    }
  };
  findFile(event.sender);
}

function onFiles(event, data) {
  const rc = preferences.getPreferences(),
    dirname = path.resolve(data.dir || USER_WD);

  USER_WD = dirname;

  let files = fs.readdirSync(dirname).map(function (filename) {
    return {
      filename: path.join(dirname, filename),
      basename: filename,
      isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
    };
  });

  files = files.filter(function (f) {
    if (rc.displayDotFiles == true) {
      return true;
    } else {
      return !/^\./.test(f.basename);
    }
  });

  event.returnValue = {
    files: files,
    dir: dirname,
    home: USER_HOME
  };
}

/**
 * @param {Event} event
 * @param {string} pythonPath
 */
function onLaunchKernel(event, pythonPath) {
  log('info', 'starting kernel');
  log('debug', 'onLaunchKernel', event, pythonPath);

  createPythonKernel(pythonPath, false);
  event.returnValue = true;
}

/**
 *
 * @param {Event} event
 * @param {string} pythonPath
 */
function onTestPath(event, pythonPath) {
  const python = global.python;

  log('debug', 'onTestPath', event, pythonPath);

  pythonPath = pythonPath || python.spawnfile;

  kernel.testPythonPath(pythonPath, function (err, result) {
    if (err) {
      log('error', 'onTestPath', err);
      event.returnValue = { python: false, jupyter: false };
      return;
    }
    event.returnValue = result;
  });
}

function onAddPythonPath(event, pythonPath) {
  const rc = preferences.getPreferences(),
    paths = rc.pythonPaths || [];

  // make sure rc.pythonCmd is in the list
  if (rc.pythonCmd) {
    if (paths.indexOf(rc.pythonCmd) < 0) {
      paths.push(rc.pythonCmd);
    }
  }
  if (paths.indexOf(pythonPath) > -1) {
    event.returnValue = 'path already exists.';
    return;
  }
  paths.push(pythonPath);
  preferences.setPreferences('pythonPaths', paths);
  event.returnValue = true;
}

function onRemovePythonPath(event, pythonPath) {
  const rc = preferences.getPreferences(),
    paths = rc.pythonPaths || [];

  if (paths.indexOf(pythonPath) > -1) {
    index = paths.indexOf(pythonPath);
    paths.splice(index, 1);
  }
  if (rc.pythonCmd == pythonPath) {
    preferences.setPreferences('pythonCmd', null);
  }
  preferences.setPreferences('pythonPaths', paths);
  event.returnValue = true;
}

function onGetHome(event) {
  event.returnValue = USER_HOME;
}

function onGetWD(event) {
  event.returnValue = USER_WD;
}

function onSetWD(event, wd) {
  USER_WD = wd;
  preferences.setPreferences('defaultWd', wd);
  event.returnValue = USER_WD;
}

function onMD(event, data) {
  md(data.doc, python, false, function (err, doc) {
    if (err) {
      log('error', 'onMD', err);
    }

    event.returnValue = doc;
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
 * 
 */
function onUpdateAndRestart() {
  const autoUpdater = electron.autoUpdater;

  autoUpdater.quitAndInstall();
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
  log('error', 'onCloseWindow', this, event);

  this.webContents.send('kill');
}

/**
 * If python was already set up, kill it now.
 */
function killPython() {
  const python = global.python;

  if (python && python.kill) {
    python.kill();
  }
}

function updateWindowSetupStatus(window, status) {
  if (window) {
    window.webContents.send('setup-status', status);
  }
}

/**
 * @param {string} pythonPath
 * @param {boolean} isFirstRun
 */
function createPythonKernel(pythonPath, isFirstRun) {
  const startupWindow = browserWindows.getByName('startupWindow'),
    mainWindow = browserWindows.getByName('mainWindow'),
    displayWindowContents = mainWindow.webContents;

  killPython();

  kernel.startNewKernel(pythonPath, function (err, python) {
    const defaultWd = preferences.getPreferences().defaultWd;

    global.python = python;
    err.isFirstRun = isFirstRun;

    if (err) {
      displayWindowContents.send('log', '[PATH-TEST-RESULT]: ' + JSON.stringify(err));
      log('warn', 'createPythonKernel', 'trigger startup window, but is null');
      updateWindowSetupStatus(startupWindow, err);
      if (err.python == false || err.jupyter == false) {
        return;
      }
    }

    if (python == null) {
      updateWindowSetupStatus(startupWindow, { python: false, jupyter: false });
      return;
    }

    python.execute('cd ' + defaultWd);

    preferences.setPreferences('pythonCmd', python.spawnfile);
    updateWindowSetupStatus(startupWindow, { python: true, jupyter: true });

    displayWindowContents.send('setup-preferences');
    displayWindowContents.send('refresh-variables');
    displayWindowContents.send('refresh-packages');
    displayWindowContents.send('set-working-directory', global.USER_WD || '.');

    function startup() {
      displayWindowContents.send('log', 'using python: ' + python.spawnfile);
      displayWindowContents.send('ready');
    }

    // if we autodetected, let the user know we're good to go
    if (! pythonPath) {
      startup();
      displayWindowContents.send('startup-error', null);
      displayWindowContents.send('log', '[ERROR]: ' + err);
    } else {
      startup();
    }
  });
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

function setGlobals() {
  global.python = null;
  global.USER_HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

  const defaultWd = preferences.getPreferences().defaultWd;

  // make sure the default working directory exists before actually using it
  if (defaultWd && fs.existsSync(defaultWd)) {
    global.USER_WD = defaultWd;
  } else {
    global.USER_WD = USER_HOME;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
function onReady() {
  let mainWindow, startupWindow;

  setGlobals();

  mainWindow = browserWindows.createMainWindow('mainWindow', {
    url: 'file://' + path.join(__dirname, '/../../static/desktop-index.html')
  });
  startupWindow = browserWindows.createStartupWindow('startupWindow', {
    url: 'file://' + path.join(__dirname, '/../../static/startup.html')
  });

  startupWindow.webContents.on('did-finish-load', function () {
    // mainWindow.openDevTools();
    mainWindow.webContents.on('did-finish-load', function () {
      // keep track of the app version the user is on. this is convenient for
      // reporting bugs
      const app = electron.app,
        rc = preferences.getPreferences();
      let isFirstRun = false;

      if (rc.version == null) {
        isFirstRun = true;
        preferences.setPreferences('version', app.getVersion());
        mainWindow.webContents.send('prompt-for-sticker');
      }

      if (rc.version && rc.version != app.getVersion() && ! rc.email) {
        preferences.setPreferences('version', app.getVersion());

        if (! rc.email) {
          mainWindow.webContents.send('prompt-for-sticker');
        }
      }

      createPythonKernel(rc.pythonCmd, isFirstRun, mainWindow);
    });
  });

  // Open the devtools.
  // mainWindow.openDevTools();

  attachIpcMainEvents();

  checkForUpdates(mainWindow.webContents, false);
}

/**
 * @param {Event} event
 * @param {string} filePath
 */
function openFile(event, filePath) {
  browserWindows.send('mainWindow', 'open-file', filePath);
}

/**
 * Attaches events to the main process
 */
function attachIpcMainEvents() {
  const ipcMain = electron.ipcMain;

  ipcMain.on('quit', onQuitApplication);
  ipcMain.on('preferences-get', onGetPreferences);
  ipcMain.on('preferences-post', onSetPreferences);
  ipcMain.on('command', onCommand);
  ipcMain.on('index-files', onIndexFiles);
  ipcMain.on('files', onFiles);
  ipcMain.on('launch-kernel', onLaunchKernel);
  ipcMain.on('test-path', onTestPath);
  ipcMain.on('add-python-path', onAddPythonPath);
  ipcMain.on('remove-python-path', onRemovePythonPath);
  ipcMain.on('home-get', onGetHome);
  ipcMain.on('wd-get', onGetWD);
  ipcMain.on('wd-post', onSetWD);
  ipcMain.on('md', onMD);
  ipcMain.on('pdf', onPDF);
  ipcMain.on('file-get', onGetFile);
  ipcMain.on('file-post', onSaveFile);
  ipcMain.on('update-and-restart', onUpdateAndRestart);
  ipcMain.on('check-for-updates', _.partial(checkForUpdates, true));
  ipcMain.on('exit-tour', onExitTour);
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

module.exports.onAddPythonPath = onAddPythonPath;
module.exports.onCommand = onCommand;
module.exports.onGetHome = onGetHome;
module.exports.onGetPreferences = onGetPreferences;
module.exports.onLaunchKernel = onLaunchKernel;
module.exports.onMD = onMD;
module.exports.onPDF = onPDF;
module.exports.onRemovePythonPath = onRemovePythonPath;
module.exports.onQuitApplication = onQuitApplication;
module.exports.onSetPreferences = onSetPreferences;
module.exports.onTestPath = onTestPath;
module.exports.openFile = openFile;
module.exports.onReady = onReady;
module.exports.onCloseWindow = onCloseWindow;
module.exports.onWindowAllClosed = onWindowAllClosed;

attachAppEvents();
