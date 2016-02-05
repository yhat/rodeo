var app = require('app');
var autoUpdater = require('auto-updater');
var BrowserWindow = require('electron').BrowserWindow;
var os = require('os');
var fs = require('fs');
var path = require('path');
var https = require('https');
var querystring = require('querystring');
var ipc = require('electron').ipcMain;
var crashReporter = require('electron').crashReporter;

var kernel = require('../rodeo/kernel');
var md = require('../rodeo/md');
var findFile = require('../rodeo/find-file');
var preferences = require('../rodeo/preferences');

global.python = null;
global.USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
global.USER_WD = preferences.getPreferences().defaultWd || USER_HOME;


function createPythonKernel(pythonPath, isFirstRun, displayWindow) {
  if (python && python.kill) {
    python.kill();
  }
  kernel.startNewKernel(pythonPath, function(err, python) {
    global.python = python;
    err.isFirstRun = isFirstRun;

    if (err) {
      displayWindow.webContents.send('log', "[PATH-TEST-RESULT]: " + JSON.stringify(err));
      if (startupWindow) {
        startupWindow.webContents.send('setup-status', err)
      } else {
        console.log("tried to trigger startup window, but that mothafucka is null");
      }
      if (err.python==false || err.jupyter==false) {
        return;
      }
    }

    preferences.setPreferences('pythonCmd', python.spawnfile);
    if (startupWindow) {
      startupWindow.webContents.send('setup-status', { python: true, jupyter: true });
    }

    displayWindow.webContents.send('setup-preferences');
    displayWindow.webContents.send('refresh-variables');
    displayWindow.webContents.send('refresh-packages');
    displayWindow.webContents.send('set-working-directory', global.USER_WD || '.');

    function startup() {
      displayWindow.webContents.send('log', "using python: " + python.spawnfile);
      displayWindow.webContents.send('ready');
    }

    // if we autodetected, let the user know we're good to go
    if (! pythonPath) {
      console.log("telling user we autodetected")
      startup();
      displayWindow.webContents.send("startup-error", null);
      displayWindow.webContents.send('log', "[ERROR]: " + err);
    } else {
      startup()
    }
  });
}

crashReporter.start({
  productName: 'Yhat Dev',
  companyName: 'Yhat',
  submitURL: 'https://rodeo-updates.yhat.com/crash',
  autoSubmit: true
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var startupWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  var atomScreen = require('screen');
  var size = atomScreen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({ width: size.width, height: size.height });
  startupWindow = new BrowserWindow({
    useContentSize: true,
    resizable: false,
    moveable: false,
    center: true,
    alwaysOnTop: true
  });
  // startupWindow.openDevTools();
  startupWindow.on('closed', function() {
    startupWindow = null;
  });

  // and load the index.html of the app.
  startupWindow.loadURL('file://' + __dirname + '/../../static/startup.html');

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/../../static/desktop-index.html');
  // mainWindow.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {
    // keep track of the app version the user is on. this is convenient for
    // reporting bugs
    var rc = preferences.getPreferences();
    var isFirstRun = false;
    if (rc.version==null) {
      isFirstRun = true;
      preferences.setPreferences('version', app.getVersion());
      mainWindow.webContents.send('prompt-for-sticker');
    }
    if (rc.version && rc.version != app.getVersion()) {
      preferences.setPreferences('version', app.getVersion());
      if (! rc.email) {
        mainWindow.webContents.send('prompt-for-sticker');
      }
    }

    createPythonKernel(rc.pythonCmd, isFirstRun, mainWindow);
    var wd;
    if (process.argv.length == 5) {
      wd = process.argv[4];
      USER_WD = wd;
    }
    if (wd) {
      mainWindow.webContents.send('log', "[INFO]: working directory passed as argument: `" + wd + "`");
      mainWindow.webContents.send('set-wd', wd);
    }
  });

  // Open the devtools.
  // mainWindow.openDevTools();

  var internetStatus = 'online';
  ipc.on('online-status-changed', function(evt, status) {
    internetStatus = status;
  });

  ipc.on('quit', function(event) {
    app.quit();
  });

  // server like routes
  ipc.on('preferences-get', function(event, arg) {
    var rc = preferences.getPreferences();
    event.returnValue = rc;
  });

  ipc.on('preferences-post', function(event, data) {
    preferences.setPreferences(data.name, data.value);
    event.returnValue = null;
  });

  ipc.on('command', function(event, data) {
    if (python && python.executeStream) {
      if (data.stream==true || data.stream=='true') {
        python.executeStream(data.command, data.autocomplete=="true", function(result) {
          result.command = data.command;
          if (result.image || result.html) {
            mainWindow.webContents.send('plot', result);
            mainWindow.webContents.send('refresh-variables');
          }
          event.sender.send('command', result);
        });
      } else {
        python.execute(data.command, data.autocomplete=="true" || data.autocomplete==true, function(result) {
          result.command = data.command;
          result.status = "complete";
          event.returnValue = result;
        });
      }
    } else {
      if (data.stream==true) {
        // not sure if we even need to do this one...
        event.sender.send('command', {});
      } else {
        event.returnValue = {};
      }
    }
  });

  ipc.on('index-files', function(event, arg) {
    event.sender.sendJSON = function(data) {
      if (event.sender && event.sender.send) {
        event.sender.send(data.msg, data);
      }
    }
    findFile(event.sender);
  });

  ipc.on('files', function(event, data) {
    var dirname = path.resolve(data.dir || USER_WD);
    USER_WD = dirname
    var files = fs.readdirSync(dirname).map(function(filename) {
      return {
        filename: path.join(dirname, filename),
        basename: filename,
        isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
      }
    });
    event.returnValue = {
      files: files,
      dir: dirname,
      home: USER_HOME
    };
  });

  ipc.on('launch-kernel', function(event, pythonPath) {
    console.log("STARTING KERNEL: " + pythonPath);
    createPythonKernel(pythonPath, false, mainWindow);
    event.returnValue = true;
  });

  ipc.on('test-path', function(event, pythonPath) {
    pythonPath = pythonPath || python.spawnfile;
    kernel.testPythonPath(pythonPath, function(err, result) {
      var data = { python: false, jupyter: false };
      if (err) {
        console.log('[ERROR]: ' + JSON.stringify(err));
      }
      event.returnValue = result;
    });
  });

  ipc.on('add-python-path', function(event, pythonPath) {
    var rc = preferences.getPreferences();
    var paths = rc.pythonPaths || [];

    // make sure rc.pythonCmd is in the list
    if (rc.pythonCmd) {
      if (paths.indexOf(rc.pythonCmd) < 0) {
        paths.push(rc.pythonCmd);
      }
    }
    if (paths.indexOf(pythonPath) > -1) {
      event.returnValue = "path already exists.";
      return;
    }
    paths.push(pythonPath);
    preferences.setPreferences('pythonPaths', paths);
    event.returnValue = true;
  });

  ipc.on('remove-python-path', function(event, pythonPath) {
    var rc = preferences.getPreferences();
    var paths = rc.pythonPaths || [];

    if (paths.indexOf(pythonPath) > -1) {
      index = paths.indexOf(pythonPath);
      paths.splice(index, 1);
    }
    if (rc.pythonCmd==pythonPath) {
      preferences.setPreferences('pythonCmd', null);
    }
    preferences.setPreferences('pythonPaths', paths);
    event.returnValue = true;
  });

  ipc.on('home-get', function(event) {
    event.returnValue = USER_HOME;
  });

  ipc.on('wd-get', function(event) {
    event.returnValue = USER_WD;
  });

  ipc.on('wd-post', function(event, wd) {
    USER_WD = wd;
    preferences.setPreferences("defaultWd", wd);
    event.returnValue = USER_WD;
  });

  ipc.on('md', function(event, data) {
    md(data.doc, python, false, function(err, doc) {
      event.returnValue = doc;
    });
  });

  ipc.on('pdf', function(event, data) {
    require('dialog').showSaveDialog({
      title: 'Save Report',
      default_path: USER_WD,
    }, function(destfile) {
      if (! /\.pdf/.test(destfile)) {
        destfile += ".pdf";
      }

      mainWindow.webContents.send('pdf', destfile);
    });
  });

  ipc.on('file-get', function(event, filepath) {
    if (/^~/.test(filepath)) {
      filepath = filepath.replace("~", USER_HOME);
    }
    var content = "";
    if (fs.existsSync(filepath)) {
      content = fs.readFileSync(filepath).toString();
    }
    event.returnValue = {
      basename: path.basename(filepath),
      pathname: filepath,
      content: content
    }
  });

  ipc.on('file-post', function(event, data) {
    fs.writeFile(data.filepath, data.content, function(err) {
      event.returnValue = {
        status: "OK",
        filepath: data.filepath,
        basename: path.basename(data.filepath)
      }
    });
  });

  ipc.on('update-and-restart', function() {
    autoUpdater.quitAndInstall();
  });

  ipc.on('check-for-updates', function() {
    checkForUpdates(true);
  });

  ipc.on('exit-tour', function() {
    if (startupWindow) {
      startupWindow.close();
    }
  });

  function checkForUpdates(displayNoUpdate) {
    var platform = os.platform() + '_' + os.arch();
    var version = app.getVersion();
    updateUrl = "http://localhost:3000/?" + "platform=" + platform + "&version=" + version;
    updateUrl = "https://rodeo-updates.yhat.com?" + "platform=" + platform + "&version=" + version;

    autoUpdater.on('error', function(err, msg) {
      mainWindow.webContents.send('log', "[ERROR]: " + msg);
    });

    autoUpdater.on('update-available', function(data) {
      mainWindow.webContents.send('log', "UPDATE AVAILABLE");
      mainWindow.webContents.send('log', JSON.stringify(data));
    });

    autoUpdater.on('update-not-available', function(data) {
      if (displayNoUpdate==true) {
        mainWindow.webContents.send('no-update');
      }
    });

    autoUpdater.on('update-downloaded', function(evt, releaseNotes, releaseName, releaseDate, udpateURL) {
      mainWindow.webContents.send('log', releaseNotes + '---' + releaseName + '---' + releaseDate + '---' + udpateURL);
      mainWindow.webContents.send('update-ready', { platform: 'osx' });
    });

    setTimeout(function() {
      if (/win32/.test(platform)) {
        https.get(updateUrl, function(res) {
          if (res.statusCode!=204) {
            mainWindow.webContents.send('update-ready', { platform: 'windows' });
          }
        }).on('error', function(err) {
          console.error("[ERROR]: could not check for windows update.");
        });
      } else {
        autoUpdater.setFeedURL(updateUrl);
        autoUpdater.checkForUpdates();
      }
    }, 2000);
  }

  checkForUpdates(false);

  mainWindow.on('close', function() {
    mainWindow.webContents.send('kill');
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
