/* globals USER_WD:true */
'use strict';

const electron = require('electron'),
  autoUpdater = electron.autoUpdater,
  BrowserWindow = electron.BrowserWindow,
  crashReporter = electron.crashReporter,
  ipc = electron.ipcMain,
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  https = require('https'),
  kernel = require('../rodeo/kernel'),
  md = require('../rodeo/md'),
  findFile = require('../rodeo/find-file'),
  preferences = require('../rodeo/preferences');

crashReporter.start({
  productName: 'Yhat Dev',
  companyName: 'Yhat',
  submitURL: 'https://rodeo-updates.yhat.com/crash',
  autoSubmit: true
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null,
  startupWindow = null;

function getUpdateUrl() {
  switch (process.env.NODE_ENV) {
    case 'dev': return 'http://localhost:3000';
    default: return 'https://rodeo-updates.yhat.com';
  }
}

function checkForUpdates(webContents, displayNoUpdate) {
  const app = electron.app,
    autoUpdater = electron.autoUpdater,
    platform = os.platform() + '_' + os.arch(),
    version = app.getVersion(),
    updateUrl = getUpdateUrl() + '?platform=' + platform + '&version=' + version;

  autoUpdater.on('error', function (err, msg) {
    if (err) {
      return console.error('checkForUpdates::autoUpdater:error' + err.stack);
    }

    webContents.send('log', '[ERROR]: ' + msg);
  });

  autoUpdater.on('update-available', function (data) {
    webContents.send('log', 'UPDATE AVAILABLE');
    webContents.send('log', JSON.stringify(data));
  });

  autoUpdater.on('update-not-available', function () {
    if (displayNoUpdate == true) {
      webContents.send('no-update');
    }
  });


  /* eslint max-params: ["error", 5] */
  autoUpdater.on('update-downloaded', function (evt, releaseNotes, releaseName, releaseDate, updateURL) {
    webContents.send('log', releaseNotes + '---' + releaseName + '---' + releaseDate + '---' + updateURL);
    webContents.send('update-ready', { platform: 'osx' });
  });

  setTimeout(function () {
    if (/win32/.test(platform)) {
      https.get(updateUrl, function (res) {
        if (res.statusCode != 204) {
          webContents.send('update-ready', { platform: 'windows' });
        }
      }).on('error', function (err) {
        if (err) {
          return console.error('checkForUpdates::https.get:error: ' + updateUrl + ' ' + err.stack);
        }

        console.error('[ERROR]: could not check for windows update.');
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

  console.log('onQuitApplication:', event);

  app.quit();
}

function onGetPreferences(event) {
  console.log('onGetPreferences:', event);
  event.returnValue = preferences.getPreferences();
}

/**
 * @param {Event} event
 * @param {{name: string, value: *}} data
 */
function onSetPreferences(event, data) {
  console.log('onSetPreferences:', event, data);
  preferences.setPreferences(data.name, data.value);
  event.returnValue = null;
}

/**
 * @param {object} webContents
 * @param {Event} event
 * @param {{stream: boolean, command: string, autocomplete: boolean}} data
 */
function onCommand(webContents, event, data) {
  const python = global.python;

  console.log('onCommand:', this, arguments);

  if (python && python.executeStream) {
    if (data.stream == true || data.stream == 'true') {
      python.executeStream(data.command, data.autocomplete == 'true', function (result) {
        result.command = data.command;
        if (result.image || result.html) {
          webContents.send('plot', result);
          webContents.send('refresh-variables');
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

function onLaunchKernel(mainWindow, event, pythonPath) {
  console.log('STARTING KERNEL: ' + pythonPath);
  createPythonKernel(pythonPath, false, mainWindow);
  event.returnValue = true;
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
      return console.error('Failed to getMD:' + err.stack);
    }

    event.returnValue = doc;
  });
}

function onPDF(webContents) {
  require('dialog').showSaveDialog({
    title: 'Save Report',
    default_path: USER_WD
  }, function (destfile) {
    if (! /\.pdf/.test(destfile)) {
      destfile += '.pdf';
    }

    webContents.send('pdf', destfile);
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
      return console.error('Failed to save file: ' + err.stack);
    }

    event.returnValue = {
      status: 'OK',
      filepath: data.filepath,
      basename: path.basename(data.filepath)
    };
  });
}

function onUpdateAndRestart(autoUpdater) {
  autoUpdater.quitAndInstall();
}

function onExitTour(startupWindow) {
  if (startupWindow) {
    startupWindow.close();
  }
}

function onMainWindowClosed() {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  mainWindow = null;
}

function killPython() {
  const python = global.python;

  if (python && python.kill) {
    python.kill();
  }
}

function updateStartupSetupStatus(startupWindow, status) {
  if (startupWindow) {
    startupWindow.webContents.send('setup-status', status);
  }
}

function createPythonKernel(pythonPath, isFirstRun, displayWindow) {
  const displayWindowContents = displayWindow.webContents;

  killPython();

  kernel.startNewKernel(pythonPath, function (err, python) {
    const defaultWd = preferences.getPreferences().defaultWd;

    global.python = python;
    err.isFirstRun = isFirstRun;

    if (err) {
      displayWindowContents.send('log', '[PATH-TEST-RESULT]: ' + JSON.stringify(err));
      console.log('trigger startup window, but is null');
      updateStartupSetupStatus(startupWindow, err);
      if (err.python == false || err.jupyter == false) {
        return;
      }
    }

    if (python == null) {
      updateStartupSetupStatus(startupWindow, { python: false, jupyter: false });
      return;
    }

    python.execute('cd ' + defaultWd);

    preferences.setPreferences('pythonCmd', python.spawnfile);
    updateStartupSetupStatus(startupWindow, { python: true, jupyter: true });

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
  setGlobals();

  const primaryDisplay = electron.screen.getPrimaryDisplay(),
    size = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({ width: size.width, height: size.height });
  mainWindow.loadURL('file://' + path.join(__dirname, '/../../static/desktop-index.html'));

  startupWindow = new BrowserWindow({
    useContentSize: true,
    resizable: false,
    moveable: false,
    center: true,
    alwaysOnTop: true
  });
  // startupWindow.openDevTools();
  startupWindow.on('closed', function () {
    startupWindow = null;
  });
  startupWindow.loadURL('file://' + path.join(__dirname, '/../../static/startup.html'));

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

  ipc.on('online-status-changed', function (event, status) {
    console.log('online-status-changed', status);
  });

  ipc.on('quit', onQuitApplication);
  ipc.on('preferences-get', onGetPreferences);
  ipc.on('preferences-post', onSetPreferences);
  ipc.on('command', onCommand.bind(undefined, mainWindow.webContents));
  ipc.on('index-files', function (event) {
    event.sender.sendJSON = function (data) {
      if (mainWindow && event.sender && event.sender.send) {
        event.sender.send(data.msg, data);
      }
    };
    findFile(event.sender);
  });

  ipc.on('files', function (event, data) {
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
  });

  ipc.on('launch-kernel', onLaunchKernel.bind(null, mainWindow));

  ipc.on('test-path', function (event, pythonPath) {
    pythonPath = pythonPath || python.spawnfile;
    kernel.testPythonPath(pythonPath, function (err, result) {
      if (err) {
        console.log('[ERROR]: ' + JSON.stringify(err));
        event.returnValue = { python: false, jupyter: false };
        return;
      }
      event.returnValue = result;
    });
  });

  ipc.on('add-python-path', onAddPythonPath);
  ipc.on('remove-python-path', onRemovePythonPath);
  ipc.on('home-get', onGetHome);
  ipc.on('wd-get', onGetWD);
  ipc.on('wd-post', onSetWD);
  ipc.on('md', onMD);
  ipc.on('pdf', onPDF.bind(null, mainWindow.webContents));
  ipc.on('file-get', onGetFile);
  ipc.on('file-post', onSaveFile);
  ipc.on('update-and-restart', onUpdateAndRestart.bind(null, autoUpdater));
  ipc.on('check-for-updates', checkForUpdates.bind(null, mainWindow.webContents, true));
  ipc.on('exit-tour', onExitTour.bind(null, startupWindow));

  checkForUpdates(mainWindow.webContents, false);

  mainWindow.on('close', function () {
    console.log('mainWindow::close event', this, arguments);

    mainWindow.webContents.send('kill');
  });
  mainWindow.on('closed', onMainWindowClosed);
}

/**
 * @param {Event} event
 * @param {string} filePath
 */
function openFile(event, filePath) {
  if (mainWindow) {
    mainWindow.webContents.send('open-file', filePath);
  }
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

module.exports.onQuitApplication = onQuitApplication;
module.exports.onGetPreferences = onGetPreferences;
module.exports.onSetPreferences = onSetPreferences;
module.exports.onCommand = onCommand;
module.exports.onLaunchKernel = onLaunchKernel;
module.exports.onAddPythonPath = onAddPythonPath;
module.exports.onRemovePythonPath = onRemovePythonPath;
module.exports.onGetPreferences = onGetPreferences;
module.exports.openFile = openFile;
module.exports.onWindowAllClosed = onWindowAllClosed;
module.exports.onReady = onReady;

attachAppEvents();
